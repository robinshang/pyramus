package fi.pyramus.events;

public class StudentGroupStudentCreatedEvent {

  public StudentGroupStudentCreatedEvent(Long studentGroupUserId, Long studentGroupId, Long studentId) {
    super();
    this.studentGroupUserId = studentGroupUserId;
    this.studentGroupId = studentGroupId;
    this.studentId = studentId;
  }

  public Long getStudentGroupUserId() {
    return studentGroupUserId;
  }

  public Long getStudentGroupId() {
    return studentGroupId;
  }

  public Long getStudentId() {
    return studentId;
  }

  private final Long studentGroupUserId;
  private final Long studentGroupId;
  private final Long studentId;
}
