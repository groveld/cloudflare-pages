export async function onRequestPost(context) {
  try {
    return await handleRequest(context);
  } catch (err) {
    return new Response('Error sending message', { status: 500 });
  }
}

async function handleRequest({ request, env }) {
  let formData = await request.formData();
  let name = formData.get('name');
  let email = formData.get('email');
  let message = formData.get('message');
  let token = formData.get('cf-turnstile-response');
  let ip = request.headers.get('cf-connecting-ip');

  if (!name || !email || !message) {
    return new Response('Missing required fields', { status: 400 });
  }

  let turnstileSecret = env.TURNSTILE_SECRET_KEY;
  let captchaValidated = await verifyCaptcha(turnstileSecret, token, ip);

  if (!captchaValidated) {
    return new Response('Invalid captcha', { status: 403 });
  }

  await sendEmailWithMailgun();

  return new Response('Message sent', { status: 200 });
}

async function verifyCaptcha(secret, token, ip) {
  let formData = new FormData();
  formData.append("secret", secret);
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

async function sendEmailWithMailgun() {
  try {
    return new Response('Mailgun sent', { status: 200 });
  } catch (err) {
    return new Response('Error parsing JSON content', { status: 400 });
  }
}
