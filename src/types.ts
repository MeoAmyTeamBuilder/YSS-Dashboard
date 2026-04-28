export type AllianceRole = 'Leader' | 'Officer' | 'Elite' | 'Member';

export interface AllianceMember {
  id?: number;
  idMember: string;
  nameMember: string;
  topPower: number;
  manaUsed?: number;
  totalDead: number;
  totalHealed: number;
  totalMertit?: string;
  totalKill?: string;
  roleMember?: string;
}

export interface AllianceInformation {
  id: number;
  nameAlliance: string;
  serverAlliance: string;
  tagAlliance: string;
  kpiAlliance: string;
  timeAlliance: string;
  desAlliance: string;
  imageAlliance: string;
  languageAlliance: string;
  discordLink?: string;
  zaloLink?: string;
}

export interface HistoryKingdom {
  id: number;
  status: string;
  titleHistory: string;
  desHistory: string;
  dateHistory: string;
}

export interface CheckMana {
  id?: number;
  idMember: string;
  manas: number;
  idCheckRecord: number;
}

export interface CheckMertit {
  id?: number;
  idMember: string;
  mertits: number;
  idCheckRecord: number;
}

export interface CheckDead {
  id?: number;
  idMember: string;
  deads: number;
  idCheckRecord: number;
}

export interface CheckHeal {
  id?: number;
  idMember: string;
  heals: number;
  idCheckRecord: number;
}

export interface CheckKill {
  id?: number;
  idMember: string;
  kills: number;
  idCheckRecord: number;
}

export interface CheckRecord {
  id?: number;
  nameRecord: string;
  dateRecord: string;
}

export interface User {
  id?: number;
  nameUser: string;
  passUser?: string;
  roleUser: string;
  fullNameUser?: string;
}

export interface MemberViolation {
  id?: number;
  idMember: string;
  nameMembber: string;
  stateMember: string;
  describeMember: string;
}

export interface SignGH {
  id?: number;
  idMember: string;
  nameMember: string;
  speedSign: string;
  targetPow: string;
  stateSign: number;
}

export interface CalendarKvk {
  id?: number;
  activeDate: string;
  nameDate: string;
  timeDate: string;
  desDate: string;
  importantDate?: number;
}

export interface DiCuMember {
  id?: number;
  idmember: string;
  namemember: string;
  toppower: number;
  totalkill: string;
}

export interface AllianceStats {
  totalMembers: number;
  totalPower: number;
  activeToday: number;
  rank: number;
}
