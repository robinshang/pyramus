package fi.pyramus.webhooks;

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
  PERSON_ARCHIVE  
}
