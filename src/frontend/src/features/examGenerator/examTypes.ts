/**
 * Local type definitions for the Exam Generator feature.
 * These types are used only on the frontend since the backend no longer handles exam generation.
 */

import { Principal } from '@icp-sdk/core/principal';

export enum Board {
  CBSE = 'CBSE',
  State = 'State',
}

export interface SyllabusScope {
  chapters: string[];
  topics: string[];
}

export interface ExamRequest {
  requester: Principal;
  board: Board;
  grade: bigint;
  subject: string;
  syllabusScope: SyllabusScope;
  duration: bigint;
  totalMarks: bigint;
  difficultyTarget: string;
  timestamp: bigint;
}
