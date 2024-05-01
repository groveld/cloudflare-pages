export const onRequestPost = async (context) => {
  try {
    return await handleRequest(context);
  } catch (err) {
    return new Response('Something went wrong', { status: 500 });
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

  const isTokenValid = await validateToken(env, token, ip);
  if (!isTokenValid) {
    return new Response('Invalid token', { status: 403 });
  }

  const isEmailSent = await sendEmailWithMailgun(env, name, email, subject, message);
  if (!isEmailSent) {
    return new Response('Error sending message', { status: 500 });
  }

  return new Response('Message sent successfully', { status: 200 });
}

const sendRequest = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json();
  return data;
}

const validateToken = async (env, token, ip) => {
  const formData = new FormData();
  formData.append("secret", env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  formData.append("remoteip", ip);

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const options = {
    method: "POST",
    body: formData,
  };

  const response = await sendRequest(url, options);
  return response.success;
}

const sendEmailWithMailgun = async (env, name, email, subject, message) => {
  const formData = new FormData();
  formData.append("from", env.MAILGUN_FROM);
  formData.append('h:Reply-To' , name + " <" + email + ">");
  formData.append("to", env.MAILGUN_TO);
  formData.append("subject", "New message from " + name);
  formData.append("html", "<b>From:</b><br>" + name + "<br><br><b>Email:</b><br>" + email + "<br><br><b>Subject:</b><br>" + subject + "<br><br><b>Message:</b><br>" + message);

  const url = `https://${env.MAILGUN_BASE_URL}/v3/${env.MAILGUN_DOMAIN}/messages`;
  const options = {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`api:${env.MAILGUN_API_KEY}`)}`,
    },
    body: formData,
  };

  const response = await sendRequest(url, options);
  return response.message === 'Queued. Thank you.';
}
