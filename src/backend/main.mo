import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use persistent actor class with migration

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Role definition including admin for schools
  type MyUserRole = {
    #schoolAdmin;
    #teacher;
    #parent;
    #student;
  };

  // Types
  // School entity
  type School = {
    id : Nat;
    name : Text;
    address : Text;
    contactEmail : Text;
  };

  // Student group/class
  type StudentGroup = {
    id : Nat;
    name : Text;
    gradeLevel : Nat;
    schoolId : Nat;
  };

  // User profiles
  public type UserProfile = {
    id : Nat;
    principal : Principal;
    name : Text;
    email : Text;
    role : MyUserRole;
    schoolId : ?Nat;
    groupId : ?Nat;
  };

  // Parent-student relationship
  type ParentLink = {
    parentId : Nat;
    studentId : Nat;
  };

  // Progress data structures
  type TutoringSession = {
    studentId : Nat;
    subject : Text;
    topic : Text;
    timestamp : Time.Time;
    understandingScore : Nat;
    correctnessScore : Nat;
  };

  // Database maps
  let schools = Map.empty<Nat, School>();
  let groups = Map.empty<Nat, StudentGroup>();
  let users = Map.empty<Nat, UserProfile>();
  let principalToUserId = Map.empty<Principal, Nat>();
  let tutoringSessions = Map.empty<Nat, List.List<TutoringSession>>();
  var parentLinks = List.empty<ParentLink>();
  var nextId = 1;

  // Helper functions
  func getUserIdByPrincipal(principal : Principal) : ?Nat {
    principalToUserId.get(principal);
  };

  func getUserByPrincipal(principal : Principal) : ?UserProfile {
    switch (getUserIdByPrincipal(principal)) {
      case (?userId) { users.get(userId) };
      case (null) { null };
    };
  };

  func isParentOfStudent(parentId : Nat, studentId : Nat) : Bool {
    parentLinks.toArray().any(
      func(link) { link.parentId == parentId and link.studentId == studentId }
    );
  };

  func getParentIdByCaller(caller : Principal) : ?Nat {
    switch (getUserByPrincipal(caller)) {
      case (?profile) {
        if (profile.role == #parent) { ?profile.id } else { null };
      };
      case (null) { null };
    };
  };

  func getStudentIdByCaller(caller : Principal) : ?Nat {
    switch (getUserByPrincipal(caller)) {
      case (?profile) {
        if (profile.role == #student) { ?profile.id } else { null };
      };
      case (null) { null };
    };
  };

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    getUserByPrincipal(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    getUserByPrincipal(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (getUserIdByPrincipal(caller)) {
      case (?existingId) {
        if (existingId != profile.id) {
          Runtime.trap("Unauthorized: Cannot modify another user's profile");
        };
      };
      case (null) {
        Runtime.trap("User profile not found");
      };
    };

    users.add(profile.id, profile);
  };

  public shared ({ caller }) func createSchool(name : Text, address : Text, contactEmail : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create schools");
    };

    let id = nextId;
    let school : School = {
      id;
      name;
      address;
      contactEmail;
    };
    schools.add(id, school);
    nextId += 1;
    id;
  };

  public shared ({ caller }) func createGroup(schoolId : Nat, name : Text, gradeLevel : Nat) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create groups");
    };

    if (not schools.containsKey(schoolId)) {
      Runtime.trap("Invalid school id");
    };

    let id = nextId;
    let group : StudentGroup = {
      id;
      name;
      gradeLevel;
      schoolId;
    };
    groups.add(id, group);
    nextId += 1;
    id;
  };

  public shared ({ caller }) func createUserProfile(principal : Principal, name : Text, email : Text, role : MyUserRole, schoolId : ?Nat, groupId : ?Nat) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create user profiles");
    };

    let id = nextId;
    let profile : UserProfile = {
      id;
      principal;
      name;
      email;
      role;
      schoolId;
      groupId;
    };
    users.add(id, profile);
    principalToUserId.add(principal, id);

    // Assign appropriate access control role
    let accessRole = switch (role) {
      case (#schoolAdmin) { #admin };
      case (#teacher) { #user };
      case (#parent) { #user };
      case (#student) { #user };
    };
    AccessControl.assignRole(accessControlState, caller, principal, accessRole);

    nextId += 1;
    id;
  };

  public shared ({ caller }) func linkParentToStudent(parentId : Nat, studentId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can link parents to students");
    };

    let parent = users.get(parentId);
    let student = users.get(studentId);
    switch (parent, student) {
      case (?parentProfile, ?studentProfile) {
        if (parentProfile.role != #parent or studentProfile.role != #student) {
          Runtime.trap("Invalid roles for linking");
        };
        let link : ParentLink = { parentId; studentId };
        parentLinks := List.singleton(link);
      };
      case (_) { Runtime.trap("Parent or Student not found") };
    };
  };

  public shared ({ caller }) func recordTutoringSession(studentId : Nat, subject : Text, topic : Text, understandingScore : Nat, correctnessScore : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record progress");
    };

    switch (getStudentIdByCaller(caller)) {
      case (?callerStudentId) {
        if (callerStudentId != studentId) {
          Runtime.trap("Unauthorized: Can only record your own progress");
        };
      };
      case (null) {
        Runtime.trap("Unauthorized: Only students can record progress");
      };
    };

    let session : TutoringSession = {
      studentId;
      subject;
      topic;
      timestamp = Time.now();
      understandingScore;
      correctnessScore;
    };

    switch (tutoringSessions.get(studentId)) {
      case (?existingList) {
        tutoringSessions.add(studentId, List.empty<TutoringSession>());
      };
      case (null) {
        tutoringSessions.add(studentId, List.empty<TutoringSession>());
      };
    };
  };

  public query ({ caller }) func getStudentProgress(studentId : Nat) : async [TutoringSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let isAuthorized = if (AccessControl.isAdmin(accessControlState, caller)) {
      true;
    } else {
      switch (getStudentIdByCaller(caller)) {
        case (?callerStudentId) { callerStudentId == studentId };
        case (null) {
          switch (getParentIdByCaller(caller)) {
            case (?parentId) { isParentOfStudent(parentId, studentId) };
            case (null) { false };
          };
        };
      };
    };

    if (not isAuthorized) {
      Runtime.trap("Unauthorized: Can only view your own or your children's progress");
    };

    switch (tutoringSessions.get(studentId)) {
      case (?sessions) { sessions.toArray() };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getWeeklyProgressSummary(studentId : Nat) : async {
    sessionsCompleted : Nat;
    averageUnderstanding : Nat;
    averageCorrectness : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let isAuthorized = if (AccessControl.isAdmin(accessControlState, caller)) {
      true;
    } else {
      switch (getStudentIdByCaller(caller)) {
        case (?callerStudentId) { callerStudentId == studentId };
        case (null) {
          switch (getParentIdByCaller(caller)) {
            case (?parentId) { isParentOfStudent(parentId, studentId) };
            case (null) { false };
          };
        };
      };
    };

    if (not isAuthorized) {
      Runtime.trap("Unauthorized: Can only view your own or your children's progress");
    };

    let sessions = switch (tutoringSessions.get(studentId)) {
      case (?list) { list.toArray() };
      case (null) {
        return { sessionsCompleted = 0; averageUnderstanding = 0; averageCorrectness = 0 };
      };
    };

    if (sessions.size() == 0) {
      return { sessionsCompleted = 0; averageUnderstanding = 0; averageCorrectness = 0 };
    };

    let sessionsCompleted = sessions.size();
    var sumUnderstanding = 0;
    var sumCorrectness = 0;

    for (s in sessions.vals()) {
      sumUnderstanding += s.understandingScore;
      sumCorrectness += s.correctnessScore;
    };

    let averageUnderstanding = if (sessionsCompleted > 0) { sumUnderstanding / sessionsCompleted } else { 0 };
    let averageCorrectness = if (sessionsCompleted > 0) { sumCorrectness / sessionsCompleted } else { 0 };

    {
      sessionsCompleted;
      averageUnderstanding;
      averageCorrectness;
    };
  };

  public query ({ caller }) func getStudentsByParent(parentId : Nat) : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let isAuthorized = if (AccessControl.isAdmin(accessControlState, caller)) {
      true;
    } else {
      switch (getParentIdByCaller(caller)) {
        case (?callerParentId) { callerParentId == parentId };
        case (null) { false };
      };
    };

    if (not isAuthorized) {
      Runtime.trap("Unauthorized: Can only view your own linked students");
    };

    let studentIds = parentLinks.toArray().map(
      func(link) { link.studentId }
    );

    if (studentIds.size() == 0) {
      return [];
    };

    studentIds.map<Nat, UserProfile>(
      func(id) {
        switch (users.get(id)) {
          case (?profile) { profile };
          case (null) { Runtime.trap("User not found") };
        };
      }
    );
  };

  public query ({ caller }) func getSchools() : async [School] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };
    schools.values().toArray();
  };

  public query ({ caller }) func getGroupsBySchool(schoolId : Nat) : async [StudentGroup] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    groups.values().toArray().filter(
      func(g) { g.schoolId == schoolId }
    );
  };
};
