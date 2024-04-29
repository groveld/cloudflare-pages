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
  let ip = request.headers.get('cf-connecting-ip');

  if (!name || !email || !subject || !message) {
    return new Response('Missing required fields', { status: 400 });
  }

  let captchaValidated = await verifyCaptcha(env, token, ip);

  if (!captchaValidated) {
    return new Response('Invalid captcha', { status: 403 });
  }

  await sendEmailWithMailgun(env, name, email, subject, message);

  return new Response('Message sent', { status: 200 });
}

const verifyCaptcha = async (env, token, ip) => {
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
  return outcome.success;
}

const sendEmailWithMailgun = async (env, name, email, subject, message) => {
  let formData = new FormData();
  formData.append("from", env.MAILGUN_FROM);
  formData.append('h:Reply-To' , name + " <" + email + ">");
  formData.append("to", env.MAILGUN_TO);
  formData.append("bcc", name + " <" + email + ">");
  formData.append("subject", subject);
  formData.append("html", name + " <" + email + "> says:<br><br>" + message);

  let url = `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`;
  let result = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`api:${env.MAILGUN_API_KEY}`)}`,
    },
    body: formData,
  });

  let outcome = await result.json();
  return outcome.success;
}
