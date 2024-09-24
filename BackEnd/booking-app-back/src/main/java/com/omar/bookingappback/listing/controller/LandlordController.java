package com.omar.bookingappback.listing.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.omar.bookingappback.listing.dto.CreatedListingDTO;
import com.omar.bookingappback.listing.dto.SaveListingDTO;
import com.omar.bookingappback.listing.dto.sub.PictureDTO;
import com.omar.bookingappback.listing.service.LandlordService;
import com.omar.bookingappback.user.exception.UserException;
import com.omar.bookingappback.user.service.UserService;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/landlord-listing")
public class LandlordController {

    private final LandlordService landlordService;

    private final Validator validator;

    private final UserService userService;

    private ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Constructor for LandlordController.
     *
     * @param landlordService Service handling landlord listing operations.
     * @param validator Validator for validating the listing DTO.
     * @param userService Service for managing user authentication and retrieval.
     */
    public LandlordController(LandlordService landlordService, Validator validator, UserService userService) {
        this.landlordService = landlordService;
        this.validator = validator;
        this.userService = userService;
    }


    /**
     * Endpoint for creating a new listing. Expects a multipart form data with listing details and pictures.
     *
     * @param request The multipart HTTP request containing file data.
     * @param saveListingDTOString The string representation of the SaveListingDTO.
     * @return ResponseEntity containing the created listing DTO or error details.
     * @throws IOException If there's an issue parsing the input data.
     */
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CreatedListingDTO> create(
            MultipartHttpServletRequest request,
            @RequestPart(name = "dto") String saveListingDTOString
    ) throws IOException {
        // Map the uploaded files to PictureDTO objects
        List<PictureDTO> pictures = request.getFileMap()
                .values()
                .stream()
                .map(mapMultipartFileToPictureDTO()) // Convert each file to a PictureDTO.
                .toList();

        // Convert the string representation of SaveListingDTO to an actual SaveListingDTO object.
        SaveListingDTO saveListingDTO = objectMapper.readValue(saveListingDTOString, SaveListingDTO.class);
        saveListingDTO.setPictures(pictures);

        // Validate the SaveListingDTO and collect any violations.
        Set<ConstraintViolation<SaveListingDTO>> violations = validator.validate(saveListingDTO);
        if (!violations.isEmpty()) {
            // Concatenate all the violations into a single string.
            String violationsJoined = violations.stream()
                    .map(violation -> violation.getPropertyPath() + " " + violation.getMessage())
                    .collect(Collectors.joining());
            // Create a ProblemDetail object with the violation details.
            ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, violationsJoined);
            return ResponseEntity.of(problemDetail).build();
        } else {
            return ResponseEntity.ok(landlordService.create(saveListingDTO));
        }
    }

    /**
     * Utility function to map a MultipartFile to a PictureDTO.
     *
     * @return A function that converts MultipartFile to PictureDTO.
     */
    private static Function<MultipartFile, PictureDTO> mapMultipartFileToPictureDTO() {
        return multipartFile -> {
            try {
                // Convert the multipart file into a PictureDTO with byte data, content type, and set cover to false.
                return new PictureDTO(multipartFile.getBytes(), multipartFile.getContentType(), false);
            } catch (IOException ioe) {
                throw new UserException(String.format("Cannot parse multipart file: %s", multipartFile.getOriginalFilename()));
            }
        };
    }
}
