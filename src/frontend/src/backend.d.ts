import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TutoringSession {
    topic: string;
    studentId: bigint;
    subject: string;
    correctnessScore: bigint;
    understandingScore: bigint;
    timestamp: Time;
}
export type Time = bigint;
export interface StudentGroup {
    id: bigint;
    name: string;
    schoolId: bigint;
    gradeLevel: bigint;
}
export interface School {
    id: bigint;
    name: string;
    address: string;
    contactEmail: string;
}
export interface UserProfile {
    id: bigint;
    principal: Principal;
    name: string;
    role: MyUserRole;
    email: string;
    groupId?: bigint;
    schoolId?: bigint;
}
export enum MyUserRole {
    teacher = "teacher",
    schoolAdmin = "schoolAdmin",
    student = "student",
    parent = "parent"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createGroup(schoolId: bigint, name: string, gradeLevel: bigint): Promise<bigint>;
    createSchool(name: string, address: string, contactEmail: string): Promise<bigint>;
    createUserProfile(principal: Principal, name: string, email: string, role: MyUserRole, schoolId: bigint | null, groupId: bigint | null): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGroupsBySchool(schoolId: bigint): Promise<Array<StudentGroup>>;
    getSchools(): Promise<Array<School>>;
    getStudentProgress(studentId: bigint): Promise<Array<TutoringSession>>;
    getStudentsByParent(parentId: bigint): Promise<Array<UserProfile>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeeklyProgressSummary(studentId: bigint): Promise<{
        averageUnderstanding: bigint;
        averageCorrectness: bigint;
        sessionsCompleted: bigint;
    }>;
    isCallerAdmin(): Promise<boolean>;
    linkParentToStudent(parentId: bigint, studentId: bigint): Promise<void>;
    recordTutoringSession(studentId: bigint, subject: string, topic: string, understandingScore: bigint, correctnessScore: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
