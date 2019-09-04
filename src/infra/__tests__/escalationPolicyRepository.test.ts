import { EscalationPolicy } from "../../domain/EscalationPolicy";
import {
  persistEscalationPolicy,
  findEscalationPolicyById,
} from "../escalationPolicyRepository";

describe("Escalation Policy Repository", () => {
  it("persist and read an escalation policy", async () => {
    // given
    const policy: EscalationPolicy = {
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
        {
          targets: [
            {
              type: "EMAIL",
              email: "olivier.pailhes@aircall.io",
            },
          ],
        },
      ],
    };

    // when
    await persistEscalationPolicy("123", policy);
    const readPolicy = await findEscalationPolicyById("123");

    // then
    expect(readPolicy).toEqual(policy);
  });
});
