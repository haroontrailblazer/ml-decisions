import {
  ClipboardText,
  TrafficSign,
  MagnifyingGlass,
  Ladder,
  Stack,
  Database,
  Flask,
  ArrowsClockwise,
  Heartbeat,
  CheckCircle,
  Scroll,
  type IconProps,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";

export const SECTION_ICONS: Record<string, ComponentType<IconProps>> = {
  clipboard: ClipboardText,
  traffic: TrafficSign,
  lens: MagnifyingGlass,
  ladder: Ladder,
  stack: Stack,
  database: Database,
  flask: Flask,
  loop: ArrowsClockwise,
  pulse: Heartbeat,
  check: CheckCircle,
  scroll: Scroll,
};

export function SectionGlyph({
  name,
  ...props
}: { name: string } & IconProps) {
  const Cmp = SECTION_ICONS[name] ?? ClipboardText;
  return <Cmp {...props} />;
}
