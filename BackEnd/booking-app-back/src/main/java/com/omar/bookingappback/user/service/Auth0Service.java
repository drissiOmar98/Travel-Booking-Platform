package com.omar.bookingappback.user.service;


import com.auth0.client.auth.AuthAPI;
import com.auth0.client.mgmt.ManagementAPI;
import com.auth0.client.mgmt.filter.FieldsFilter;
import com.auth0.exception.Auth0Exception;
import com.auth0.json.auth.TokenHolder;
import com.auth0.json.mgmt.users.User;
import com.auth0.net.Response;
import com.auth0.net.TokenRequest;

import com.omar.bookingappback.config.SecurityUtils;
import com.omar.bookingappback.user.dto.ReadUserDTO;
import com.omar.bookingappback.user.exception.UserException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Service class responsible for interacting with Auth0 and managing user roles.
 *
 * This class uses Okta's OAuth2 configuration for client authentication and assigns specific roles
 * (such as the landlord role) to users in the Auth0 system.
 */
@Service
public class Auth0Service {


    /**
     * Client ID for OAuth2 authentication, fetched from the application's configuration.
     */
    @Value("${okta.oauth2.client-id}")
    private String clientId;

    /**
     * Client secret for OAuth2 authentication, fetched from the application's configuration.
     */
    @Value("${okta.oauth2.client-secret}")
    private String clientSecret;

    /**
     * Domain (issuer) for OAuth2 authentication, fetched from the application's configuration.
     */
    @Value("${okta.oauth2.issuer}")
    private String domain;

    /**
     * Role ID for the landlord role, fetched from the application's configuration.
     */
    @Value("${application.auth0.role-landlord-id}")
    private String roleLandlordId;

    /**
     * Adds the landlord role to a user if the user doesn't already have it.
     *
     * @param readUserDTO The user DTO containing user information.
     */
    public void addLandlordRoleToUser(ReadUserDTO readUserDTO) {
        if (readUserDTO.authorities().stream().noneMatch(role -> role.equals(SecurityUtils.ROLE_LANDLORD))) {
            try {
                String accessToken = this.getAccessToken();
                assignRoleById(accessToken, readUserDTO.email(), readUserDTO.publicId(), roleLandlordId);
            } catch (Auth0Exception a) {
                throw new UserException(String.format("not possible to assign %s to %s", roleLandlordId, readUserDTO.publicId()));
            }
        }
    }


    /**
     * Assigns a role to a user by their email and public ID.
     *
     * @param accessToken The access token for Auth0 API calls.
     * @param email The user's email to find them in Auth0.
     * @param publicId The user's public ID for logging purposes.
     * @param roleIdToAdd The role ID to assign to the user.
     * @throws Auth0Exception If an error occurs during the role assignment process.
     */
    private void assignRoleById(String accessToken, String email, UUID publicId, String roleIdToAdd) throws Auth0Exception {
        ManagementAPI mgmt = ManagementAPI.newBuilder(domain, accessToken).build();
        Response<List<User>> auth0userByEmail = mgmt.users().listByEmail(email, new FieldsFilter()).execute();
        User user = auth0userByEmail.getBody()
                .stream().findFirst()
                .orElseThrow(() -> new UserException(String.format("Cannot find user with public id %s", publicId)));
        mgmt.roles().assignUsers(roleIdToAdd, List.of(user.getId())).execute();
    }


    /**
     * Retrieves an access token from Auth0 for making API requests.
     *
     * @return The access token as a String.
     * @throws Auth0Exception If an error occurs during token retrieval.
     */
    private String getAccessToken() throws Auth0Exception {
        AuthAPI authAPI = AuthAPI.newBuilder(domain, clientId, clientSecret).build();
        TokenRequest tokenRequest = authAPI.requestToken(domain + "api/v2/");
        TokenHolder holder = tokenRequest.execute().getBody();
        return holder.getAccessToken();
    }






}
