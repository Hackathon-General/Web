import he from "./he.json";
import stationsData from "./stations.json";
import eventsData from "./events.json";
import routesData from "./routes.json";

export const content = he;
export const stations = stationsData.stations;
export const events = eventsData;
export const routes = routesData;

export type Station = (typeof stationsData.stations)[number];
export type ValueKey = Station["value"];

/** Brand palette — mirrors App's theme/colors.ts */
export const colors = {
  terracotta: "#D68C45",
  forest: "#2C6E49",
  deepGreen: "#2A3C2C",
  mint: "#60D394",
  sky: "#A6E1F1",
  gold: "#FFCF56",
  ink: "#212121",
  white: "#FFFFFF",
  bg: "#FEF6ED",
  muted: "#646464",
  line: "#F0F0F0",
  danger: "#DF3131",
  success: "#0DC143",
} as const;

/** Value category → marker/chip color + icon. */
export const valueTheme: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  loveOfLand: { label: "אהבת הארץ", color: "#2C6E49", icon: "leaf" },
  justice: { label: "צדק", color: "#FFCF56", icon: "scale-balance" },
  volunteering: { label: "התנדבות", color: "#D68C45", icon: "hand-heart" },
  helpingOthers: { label: "עזרה לזולת", color: "#FF8044", icon: "heart" },
  seeingOther: { label: "ראיית האחר", color: "#A6E1F1", icon: "eye" },
  coexistence: { label: "קיום משותף", color: "#60D394", icon: "account-group" },
};
