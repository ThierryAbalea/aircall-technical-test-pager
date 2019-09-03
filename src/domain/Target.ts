import { sendMail } from "../infra/mailSender";
import { sendSms } from "../infra/smsSender";

type Alert = import("./Alert").Alert;

export type Target = EmailTarget | SmsTarget;

export interface EmailTarget {
  type: "EMAIL";
  email: string;
}

export interface SmsTarget {
  type: "SMS";
  phoneNumber: string;
}

export function notifyTarget(target: Target, alert: Alert): Promise<void> {
  switch (target.type) {
    case "EMAIL":
      return sendAlertByMail(target, alert);
    case "SMS":
      return sendAlertBySms(target, alert);
    default:
      return unexpectedTargetType(target);
  }
}

function sendAlertByMail(
  target: EmailTarget,
  { errorMessage }: Alert,
): Promise<void> {
  return sendMail({
    from: "pager.no-reply@aircall.io",
    to: [target.email],
    subject: errorMessage,
    body: errorMessage,
  });
}

function sendAlertBySms(
  { phoneNumber }: SmsTarget,
  { errorMessage }: Alert,
): Promise<void> {
  return sendSms({
    phoneNumber,
    message: errorMessage,
  });
}

function unexpectedTargetType(target: never): Promise<void> {
  throw new Error(`Unexpected target ${JSON.stringify(target)}`);
}
