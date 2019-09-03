import { findEscalationPolicyById } from "../infra/escalationPolicyRepository";
import { notifyTarget } from "./Target";
import { setAckTimeout } from "../infra/ackTimer";

type Service = import("./Service").Service;
type EscalationPolicy = import("../domain/EscalationPolicy").EscalationPolicy;

export interface Alert {
  errorMessage: string;
  level: number; // starting from 1
  ack: boolean;
}

export async function triggerAlert(service: Service): Promise<Service> {
  const alert = {
    errorMessage: `Service ${service.id} is crashed`,
    level: 0,
    ack: false,
  };
  const newAlert = await nextLevel(service, alert);
  return {
    ...service,
    status: "CRASHED",
    alert: newAlert,
  };
}

export async function handleAckTimeout(service: Service): Promise<Service> {
  if (service.status === "UP") {
    return service;
  }
  const newAlert = await nextLevel(service, service.alert);
  return { ...service, alert: newAlert };
}

export function handleTargetAck(service: Service): Service {
  if (service.status === "UP") {
    return service;
  }
  return {
    ...service,
    alert: {
      ...service.alert,
      ack: true,
    },
  };
}

async function nextLevel(
  { id: serviceId, escalationPolicyId }: Service,
  alert: Alert,
): Promise<Alert> {
  const policy = await findEscalationPolicyById(escalationPolicyId);
  if (isLastLevel(policy, alert) || alert.ack) {
    return alert;
  }
  const newAlert = incrementLevel(alert);
  setAckTimeout(serviceId, 30 /* minutes */);
  await notifyTargets(newAlert, policy);
  return newAlert;
}

function isLastLevel(policy: EscalationPolicy, alert: Alert): boolean {
  return alert.level === policy.levels.length;
}

function incrementLevel(alert: Alert): Alert {
  return {
    ...alert,
    level: alert.level + 1,
  };
}

async function notifyTargets(
  alert: Alert,
  policy: EscalationPolicy,
): Promise<void> {
  const level = policy.levels[alert.level - 1];
  for (const target of level.targets) {
    await notifyTarget(target, alert);
  }
}
