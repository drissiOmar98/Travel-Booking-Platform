package com.omar.bookingappback.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import java.util.HashSet;
import java.util.Set;


/**
 * Configuration class for Spring Security.
 *
 * This class sets up security for the application, enabling OAuth2 login, JWT-based
 * resource server support, CSRF protection, and custom mapping of authorities.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfiguration {


    /**
     * Configures the security filter chain for handling HTTP security, including
     * authorization, CSRF protection, and OAuth2 login.
     *
     * @param http The HttpSecurity object used to configure security settings.
     * @return A SecurityFilterChain instance.
     * @throws Exception If an error occurs during configuration.
     */
    @Bean
    public SecurityFilterChain configure(HttpSecurity http) throws Exception {
        // Custom CSRF token handler
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName(null); // Disables the default CSRF request attribute name
        http.authorizeHttpRequests(authorize -> authorize
                        // Define public endpoints that don't require authentication
                        .requestMatchers(HttpMethod.GET, "api/tenant-listing/get-all-by-category").permitAll()
                        .requestMatchers(HttpMethod.GET, "api/tenant-listing/get-one").permitAll()
                        .requestMatchers(HttpMethod.POST, "api/tenant-listing/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "api/booking/check-availability").permitAll()
                        .requestMatchers(HttpMethod.GET, "assets/*").permitAll()
                        .anyRequest()
                        .authenticated())
                // CSRF configuration with CSRF token stored in cookies
                .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(requestHandler))
                // Enable OAuth2 login and resource server using JWT tokens
                .oauth2Login(Customizer.withDefaults())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .oauth2Client(Customizer.withDefaults());

        return http.build();
    }


    /**
     * Customizes the mapping of authorities for OAuth2 users.
     *
     * This bean is responsible for converting the granted authorities of the user,
     * particularly extracting roles from the claims in the OIDC token.
     *
     * @return A GrantedAuthoritiesMapper instance that maps user authorities.
     */
    @Bean
    public GrantedAuthoritiesMapper userAuthoritiesMapper() {
        return authorities -> {
            Set<GrantedAuthority> grantedAuthorities = new HashSet<>();

            authorities.forEach(grantedAuthority -> {
                // Check if the authority is an OIDC user authority
                if (grantedAuthority instanceof OidcUserAuthority oidcUserAuthority) {
                    // Extract roles from the claims in the OIDC token and add them to granted authorities
                    grantedAuthorities
                            .addAll(SecurityUtils.extractAuthorityFromClaims(oidcUserAuthority.getUserInfo().getClaims()));
                }
            });
            return grantedAuthorities;
        };
    }

}
