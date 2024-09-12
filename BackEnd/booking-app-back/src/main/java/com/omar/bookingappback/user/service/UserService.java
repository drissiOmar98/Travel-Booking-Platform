package com.omar.bookingappback.user.service;

import com.omar.bookingappback.config.SecurityUtils;
import com.omar.bookingappback.user.dto.ReadUserDTO;
import com.omar.bookingappback.user.entity.User;
import com.omar.bookingappback.user.mapper.UserMapper;
import com.omar.bookingappback.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {


    private static final String UPDATED_AT_KEY = "updated_at";
    private final UserRepository userRepository;
    private final UserMapper userMapper;


    /**
     * Retrieves the currently authenticated user from the security context
     * and maps them to a ReadUserDTO. Throws an exception if the user cannot be found.
     *
     * @return ReadUserDTO representation of the authenticated user.
     */
    @Transactional(readOnly = true)
    public ReadUserDTO getAuthenticatedUserFromSecurityContext() {
        OAuth2User principal = (OAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = SecurityUtils.mapOauth2AttributesToUser(principal.getAttributes());
        return getByEmail(user.getEmail()).orElseThrow();
    }

    /**
     * Retrieves a user by their email and maps it to a ReadUserDTO.
     *
     * @param email The email of the user to retrieve.
     * @return Optional containing the ReadUserDTO if found, or an empty Optional.
     */
    @Transactional(readOnly = true)
    public Optional<ReadUserDTO> getByEmail(String email) {
        Optional<User> oneByEmail = userRepository.findOneByEmail(email);
        return oneByEmail.map(userMapper::readUserDTOToUser);
    }


    /**
     * Synchronizes the user's information from the Identity Provider (IDP) with the local database.
     * Updates the local user if the user has changed in the IDP or if a forced resynchronization is requested.
     *
     * @param oAuth2User The OAuth2 user attributes from the IDP.
     * @param forceResync Whether to force synchronization even if the 'updated_at' dates match.
     */
    public void syncWithIdp(OAuth2User oAuth2User, boolean forceResync) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        User user = SecurityUtils.mapOauth2AttributesToUser(attributes);
        Optional<User> existingUser = userRepository.findOneByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            if (attributes.get(UPDATED_AT_KEY) != null) {
                Instant lastModifiedDate = existingUser.orElseThrow().getLastModifiedDate();
                Instant idpModifiedDate;
                if (attributes.get(UPDATED_AT_KEY) instanceof Instant instant) {
                    idpModifiedDate = instant;
                } else {
                    idpModifiedDate = Instant.ofEpochSecond((Integer) attributes.get(UPDATED_AT_KEY));
                }
                if (idpModifiedDate.isAfter(lastModifiedDate) || forceResync) {
                    updateUser(user);
                }
            }
        } else {
            userRepository.saveAndFlush(user);
        }
    }

    /**
     * Updates the local user record in the database with new details from the IDP.
     *
     * @param user The user object containing updated information.
     */
    private void updateUser(User user) {
        Optional<User> userToUpdateOpt = userRepository.findOneByEmail(user.getEmail());
        if (userToUpdateOpt.isPresent()) {
            User userToUpdate = userToUpdateOpt.get();
            userToUpdate.setEmail(user.getEmail());
            userToUpdate.setFirstName(user.getFirstName());
            userToUpdate.setLastName(user.getLastName());
            userToUpdate.setAuthorities(user.getAuthorities());
            userToUpdate.setImageUrl(user.getImageUrl());
            userRepository.saveAndFlush(userToUpdate);
        }
    }

    /**
     * Retrieves a user by their public ID and maps it to a ReadUserDTO.
     *
     * @param publicId The public ID of the user.
     * @return Optional containing the ReadUserDTO if found, or an empty Optional.
     */
    public Optional<ReadUserDTO> getByPublicId(UUID publicId) {
        Optional<User> oneByPublicId = userRepository.findOneByPublicId(publicId);
        return oneByPublicId.map(userMapper::readUserDTOToUser);
    }



}
