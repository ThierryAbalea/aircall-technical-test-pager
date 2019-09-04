export async function sendMail(
  mail: import("../domain/Mail").Mail,
): Promise<void> {
  console.log(`send mail ${JSON.stringify(mail)}`);
}
