package com.omar.bookingappback.user.controller;

import com.omar.bookingappback.user.dto.ReadUserDTO;
import com.omar.bookingappback.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.text.MessageFormat;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")

public class UserController {

    private final UserService userService;

    // Client registration for OAuth2 configuration (e.g., Okta)
    private final ClientRegistration registration;

    /**
     * Constructor for the UserController, initializing the UserService and Okta client registration.
     *
     * @param userService The service for handling user-related operations.
     * @param registration The ClientRegistrationRepository for retrieving OAuth2 client details.
     */
    public UserController(UserService userService, ClientRegistrationRepository registration) {
        this.userService = userService;
        this.registration = registration.findByRegistrationId("okta");
    }


    /**
     * Retrieves the authenticated user from the security context. Optionally forces synchronization
     * with the Identity Provider (IDP) if the 'forceResync' parameter is true.
     *
     * @param user The authenticated OAuth2 user principal.
     * @param forceResync Whether to force synchronization with the IDP.
     * @return A ResponseEntity containing the ReadUserDTO of the authenticated user or an error status.
     */
    @GetMapping("/get-authenticated-user")
    public ResponseEntity<ReadUserDTO> getAuthenticatedUser(
            @AuthenticationPrincipal OAuth2User user, @RequestParam boolean forceResync) {
        if(user == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
            userService.syncWithIdp(user, forceResync);
            ReadUserDTO connectedUser = userService.getAuthenticatedUserFromSecurityContext();
            return new ResponseEntity<>(connectedUser, HttpStatus.OK);
        }
    }

    /**
     * Logs out the authenticated user by invalidating their session and returning a logout URL for Okta.
     *
     * @param request The HTTP servlet request, used to get the origin URL and invalidate the session.
     * @return A ResponseEntity containing the logout URL for the user to complete the logout process.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        String issuerUri = registration.getProviderDetails().getIssuerUri();
        String originUrl = request.getHeader(HttpHeaders.ORIGIN);
        Object[] params = {issuerUri, registration.getClientId(), originUrl};
        String logoutUrl = MessageFormat.format("{0}v2/logout?client_id={1}&returnTo={2}", params);
        request.getSession().invalidate();
        return ResponseEntity.ok().body(Map.of("logoutUrl", logoutUrl));
    }


}
