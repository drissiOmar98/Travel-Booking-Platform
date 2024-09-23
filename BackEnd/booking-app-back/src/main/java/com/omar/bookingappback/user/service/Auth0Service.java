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





}
