package fi.otavanopisto.pyramus.util.dataimport.scripting.api;

import fi.otavanopisto.pyramus.dao.DAOFactory;

public class MunicipalityAPI {
  
  public MunicipalityAPI(Long loggedUserId) {
    this.loggedUserId = loggedUserId;
  }

  public Long create(String name, String code) {
    return (DAOFactory.getInstance().getMunicipalityDAO().create(name, code).getId());
  }

  @SuppressWarnings("unused")
  private Long loggedUserId;
}
