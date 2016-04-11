package fi.otavanopisto.pyramus.webhooks;

public enum WebhookType {
  
  STAFF_MEMBER_CREATE,
  STAFF_MEMBER_UPDATE,
  STAFF_MEMBER_DELETE,

  STUDENT_CREATE,
  STUDENT_UPDATE,
  STUDENT_ARCHIVE,
  
  COURSE_CREATE,
  COURSE_UPDATE,
  COURSE_ARCHIVE,
  
  COURSE_STUDENT_CREATE,
  COURSE_STUDENT_UPDATE,
  COURSE_STUDENT_ARCHIVE,
  
  COURSE_STAFF_MEMBER_CREATE,
  COURSE_STAFF_MEMBER_UPDATE,
  COURSE_STAFF_MEMBER_DELETE,

  PERSON_CREATE,
  PERSON_UPDATE,
  PERSON_ARCHIVE,

  STUDENTGROUP_CREATE,
  STUDENTGROUP_UPDATE,
  STUDENTGROUP_ARCHIVE,

  STUDENTGROUP_STAFFMEMBER_CREATE,
  STUDENTGROUP_STAFFMEMBER_UPDATE,
  STUDENTGROUP_STAFFMEMBER_REMOVE,
  
  STUDENTGROUP_STUDENT_CREATE,
  STUDENTGROUP_STUDENT_UPDATE,
  STUDENTGROUP_STUDENT_REMOVE
}