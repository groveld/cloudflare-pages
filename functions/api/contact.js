export const onRequestPost = async (context) => {
  try {
    return await handleRequest(context);
  } catch (err) {
    return new Response('Error sending message', { status: 500 });
  }
}

const handleRequest = async ({ request, env }) => {
  let formData = await request.formData();
  let name = formData.get('name');
  let email = formData.get('email');
  let subject = formData.get('subject');
  let message = formData.get('message');
  let token = formData.get('cf-turnstile-response');
  let ip = request.headers.get('CF-Connecting-IP');

  if (!name || !email || !subject || !message) {
    return new Response('Missing required fields', { status: 400 });
  }

  let validatedToken = await validateToken(env, token, ip);

  if (!validatedToken) {
    return new Response('Invalid token', { status: 403 });
  }

  await sendEmailWithMailgun(env, name, email, subject, message);

  return new Response('Message sent', { status: 200 });
}

const validateToken = async (env, token, ip) => {
  let formData = new FormData();
  formData.append("secret", env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  formData.append("remoteip", ip);

  let url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  let result = await fetch(url, {
    method: "POST",
    body: formData,
  });

  let outcome = await result.json();
  return outcome.success; // true or false
}

const sendEmailWithMailgun = async (env, name, email, subject, message) => {
  let formData = new FormData();
  formData.append("from", env.MAILGUN_FROM);
  formData.append('h:Reply-To' , name + " <" + email + ">");
  formData.append("to", env.MAILGUN_TO);
  formData.append("subject", "New message from " + name + " - " + subject);
  formData.append("html", "<b>From:</b><br>" + name + "<br><br><b>Email:</b><br>" + email + "<br><br><b>Subject:</b><br>" + subject + "<br><br><b>Message:</b><br>" + message);

  let url = `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`;
  let result = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`api:${env.MAILGUN_API_KEY}`)}`,
    },
    body: formData,
  });

  let outcome = await result.json();
  return outcome.status === 200; // true or false
}
