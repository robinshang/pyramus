package fi.pyramus.rest.controller;

import javax.ejb.Stateless;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;

import fi.pyramus.dao.clientapplications.ClientApplicationAccessTokenDAO;
import fi.pyramus.dao.clientapplications.ClientApplicationAuthorizationCodeDAO;
import fi.pyramus.dao.clientapplications.ClientApplicationDAO;
import fi.pyramus.domainmodel.clientapplications.ClientApplication;
import fi.pyramus.domainmodel.clientapplications.ClientApplicationAccessToken;
import fi.pyramus.domainmodel.clientapplications.ClientApplicationAuthorizationCode;
import fi.pyramus.domainmodel.users.User;

@Dependent
@Stateless
public class OauthController {

  @Inject
  private ClientApplicationDAO clientApplicationDAO;

  @Inject
  private ClientApplicationAuthorizationCodeDAO clientApplicationAuthorizationCodeDAO;
  
  @Inject
  private ClientApplicationAccessTokenDAO clientApplicationAccessTokenDAO;

  public ClientApplicationAccessToken createAccessToken(String accessToken, String refreshToken, Long expires, ClientApplication clientApplication, ClientApplicationAuthorizationCode clientApplicationAuthorizationCode) {
    return clientApplicationAccessTokenDAO.create(accessToken, refreshToken, expires, clientApplication, clientApplicationAuthorizationCode);
  }
  
  public ClientApplicationAuthorizationCode createAuthorizationCode(User user, ClientApplication clientApplication, String authorizationCode, String redirectUrl){
    return clientApplicationAuthorizationCodeDAO.create(user, clientApplication, authorizationCode, redirectUrl);
  }

  public ClientApplicationAccessToken findByAccessToken(String accessToken) {
    return clientApplicationAccessTokenDAO.findByAccessToken(accessToken);
  }
  
  public ClientApplicationAccessToken findByRefreshToken(String refreshToken) {
    return clientApplicationAccessTokenDAO.findByRefreshToken(refreshToken);
  }
  
  public ClientApplication findByClientIdAndClientSecret(String clientId, String clientSecret) {
    return clientApplicationDAO.findByClientIdAndClientSecret(clientId, clientSecret);
  }

  public ClientApplicationAuthorizationCode findByClientApplicationAndAuthorizationCode(ClientApplication clientApplication, String authorizationCode) {
    return clientApplicationAuthorizationCodeDAO.findByClientApplicationAndAuthorizationCode(authorizationCode, clientApplication);
  }
  
  public ClientApplicationAccessToken findByClientApplicationAuthorizationCode(ClientApplicationAuthorizationCode clientApplicationAuthorizationCode){
    return clientApplicationAccessTokenDAO.findByAuthCode(clientApplicationAuthorizationCode);
  }
  
  public ClientApplicationAccessToken refresh(ClientApplicationAccessToken clientApplicationAccessToken, Long expires, String accessToken){
    return clientApplicationAccessTokenDAO.updateAccessToken(clientApplicationAccessTokenDAO.updateExpires(clientApplicationAccessToken, expires), accessToken);
  }
  
  public void deleteAccessToken(ClientApplicationAccessToken clientApplicationAccessToken){
    clientApplicationAccessTokenDAO.delete(clientApplicationAccessToken);
  }
  

}
