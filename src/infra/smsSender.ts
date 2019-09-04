export async function sendSms(sms: import("../domain/Sms").Sms): Promise<void> {
  console.log(`send sms ${JSON.stringify(sms)}`);
}
