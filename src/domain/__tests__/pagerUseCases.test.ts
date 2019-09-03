import {
  Service,
  onServiceCrashed,
  onAckTimeout,
  onTargetAck,
  onServiceUp,
} from "../Service";
import { sendMail } from "../../infra/mailSender";
import { sendSms } from "../../infra/smsSender";
import { setAckTimeout } from "../../infra/ackTimer";

type EscalationPolicy = import("../EscalationPolicy").EscalationPolicy;

let escalationPolicy: EscalationPolicy | null = null;

jest.mock("../../infra/escalationPolicyRepository", () => {
  return {
    findEscalationPolicyById: (): EscalationPolicy => {
      if (!escalationPolicy) {
        throw new Error(`Escalation Policy not defined`);
      }
      return escalationPolicy;
    },
  };
});
jest.mock("../../infra/mailSender", () => {
  return {
    sendMail: jest.fn(() => Promise.resolve()),
  };
});
jest.mock("../../infra/smsSender", () => {
  return {
    sendSms: jest.fn(() => Promise.resolve()),
  };
});
jest.mock("../../infra/ackTimer", () => {
  return {
    setAckTimeout: jest.fn(() => Promise.resolve()),
  };
});

describe("Pager Use Cases", () => {
  beforeAll(() => {
    escalationPolicy = {
      id: "123",
      levels: [
        {
          targets: [
            {
              type: "EMAIL",
              email: "john.doe@aircall.io",
            },
            {
              type: "SMS",
              phoneNumber: "+33612345678",
            },
          ],
        },
        {
          targets: [
            {
              type: "EMAIL",
              email: "richard.miles@aircall.io",
            },
          ],
        },
      ],
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should trigger an alert, notify all targets of the first level of the escalation policy and set a 30-minute acknowledgement delay when the service is crashed", async () => {
    // given
    const service: Service = {
      id: "call-router",
      escalationPolicyId: "123",
      status: "UP",
    };

    // when
    const crashedService = await onServiceCrashed(service);

    // then
    expect(crashedService).toEqual({
      id: "call-router",
      escalationPolicyId: "123",
      status: "CRASHED",
      alert: {
        errorMessage: "Service call-router is crashed",
        level: 1,
        ack: false,
      },
    });
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith({
      from: "pager.no-reply@aircall.io",
      to: ["john.doe@aircall.io"],
      subject: "Service call-router is crashed",
      body: "Service call-router is crashed",
    });
    expect(sendSms).toHaveBeenCalledTimes(1);
    expect(sendSms).toHaveBeenCalledWith({
      phoneNumber: "+33612345678",
      message: "Service call-router is crashed",
    });
    expect(setAckTimeout).toHaveBeenCalledWith("call-router", 30);
  });

  it("should not trigger a new alert when a service is already crashed and a new crashed event is received (may happen when the operator crash again the service during the alert handling)", async () => {
    // given
    const service: Service = {
      id: "call-router",
      escalationPolicyId: "123",
      status: "CRASHED",
      alert: {
        errorMessage: "Service call-router is crashed",
        level: 1,
        ack: false,
      },
    };

    // when
    await onServiceCrashed(service);

    // then
    expect(sendMail).toHaveBeenCalledTimes(0);
    expect(sendSms).toHaveBeenCalledTimes(0);
    expect(setAckTimeout).toHaveBeenCalledTimes(0);
  });

  it("should notify all targets of the next level of the escalation policy and set a 30-minute acknowledgement delay when the service is already crashed and the ack timeout", async () => {
    // given
    const service: Service = {
      id: "call-router",
      escalationPolicyId: "123",
      status: "CRASHED",
      alert: {
        errorMessage: "Service call-router is crashed",
        level: 1,
        ack: false,
      },
    };

    // when
    const serviceAfterTimeout = await onAckTimeout(service);

    // then
    expect(serviceAfterTimeout).toEqual({
      id: "call-router",
      escalationPolicyId: "123",
      status: "CRASHED",
      alert: {
        errorMessage: "Service call-router is crashed",
        level: 2,
        ack: false,
      },
    });
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith({
      from: "pager.no-reply@aircall.io",
      to: ["richard.miles@aircall.io"],
      subject: "Service call-router is crashed",
      body: "Service call-router is crashed",
    });
    expect(sendSms).toHaveBeenCalledTimes(0);
    expect(setAckTimeout).toHaveBeenCalledWith("call-router", 30);
  });

  it("should stop to escaladate when the last level is already reached", async () => {
    // given
    const service: Service = {
      id: "call-router",
      escalationPolicyId: "123",
      status: "CRASHED",
      alert: {
        errorMessage: "Service call-router is crashed",
        level: 2,
        ack: false,
      },
    };

    // when
    await onAckTimeout(service);

    // then
    expect(sendMail).toHaveBeenCalledTimes(0);
    expect(sendSms).toHaveBeenCalledTimes(0);
    expect(setAckTimeout).toHaveBeenCalledTimes(0);
  });

  it("should stop to escaladate after the target acknowledgement", async () => {
    // given
    const service: Service = {
      id: "call-router",
      escalationPolicyId: "123",
      status: "CRASHED",
      alert: {
        errorMessage: "Service call-router is crashed",
        level: 1,
        ack: false,
      },
    };

    // when
    const serviceAfterAck = await onTargetAck(service);
    const serviceAfterAckTimeout = await onAckTimeout(serviceAfterAck);

    // then
    expect(serviceAfterAckTimeout).toEqual({
      id: "call-router",
      escalationPolicyId: "123",
      status: "CRASHED",
      alert: {
        errorMessage: "Service call-router is crashed",
        level: 1,
        ack: true,
      },
    });
    expect(sendMail).toHaveBeenCalledTimes(0);
    expect(sendSms).toHaveBeenCalledTimes(0);
  });

  it("should stop to escaladate when the service is again up", async () => {
    // given
    const service: Service = {
      id: "call-router",
      escalationPolicyId: "123",
      status: "CRASHED",
      alert: {
        errorMessage: "Service call-router is crashed",
        level: 1,
        ack: false,
      },
    };

    // when
    const serviceUp = await onServiceUp(service);
    const serviceAfterAckTimeout = await onAckTimeout(serviceUp);

    // then
    expect(serviceAfterAckTimeout).toEqual({
      id: "call-router",
      escalationPolicyId: "123",
      status: "UP",
    });
    expect(sendMail).toHaveBeenCalledTimes(0);
    expect(sendSms).toHaveBeenCalledTimes(0);
  });
});
