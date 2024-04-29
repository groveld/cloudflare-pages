export async function onRequestPost(context) {
  try {
    return await handleRequest(context);
  } catch (err) {
    return new Response('Error sending message', { status: 500 });
  }
}

async function handleRequest({ request }) {
  let formData = await request.formData();
  let name = formData.get('name');
  let email = formData.get('email');
  let message = formData.get('message');
  let token = formData.get('cf-turnstile-response');
  let ip = request.headers.get('cf-connecting-ip');

  if (!name || !email || !message) {
    return new Response('Missing required fields', { status: 400 });
  }

  let captchaValidated = await verifyCaptcha(token, ip);

  if (!captchaValidated) {
    return new Response('Invalid captcha', { status: 403 });
  }

  await sendEmailWithMailgun(name, email, message);

  return new Response('Message sent', { status: 200 });
}

async function verifyCaptcha(token, ip) {
  let formData = new FormData();
  formData.append("secret", ENV.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  formData.append("remoteip", ip);

  let url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  let result = await fetch(url, {
    body: formData,
    method: "POST",
  });

  let outcome = await result.json();
  return outcome.success;
}

async function sendEmailWithMailgun(name, email, message) {
  let mailgunDomain = ENV.MAILGUN_DOMAIN;
  let mailgunApiKey = ENV.MAILGUN_API_KEY;
  let mailgunFrom = ENV.MAILGUN_FROM;
  let mailgunTo = ENV.MAILGUN_TO;
  let mailgunUrl = `https://api.mailgun.net/v3/${mailgunDomain}/messages`;

  let formData = new FormData();
  formData.append("from", mailgunFrom);
  formData.append('h:Reply-To' , email);
  formData.append("to", mailgunTo);
  formData.append("subject", 'Message from contact form');
  formData.append("text", name + " (" + email + ") says: " + message);

  let result = await fetch(mailgunUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`api:${mailgunApiKey}`)}`,
    },
    body: formData,
  });

  let outcome = await result.json();
  return outcome.success;
}
