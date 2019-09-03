export interface EscalationPolicy {
  id: string;
  levels: Level[];
}

export interface Level {
  targets: import("./Target").Target[];
}
