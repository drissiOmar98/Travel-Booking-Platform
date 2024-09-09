package com.omar.bookingappback.user.entity;

import com.omar.bookingappback.shared.AbstractAuditingEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "airbnb_user")
@Builder
public class User extends AbstractAuditingEntity<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "userSequenceGenerator")
    @SequenceGenerator(name = "userSequenceGenerator", sequenceName = "user_generator", allocationSize = 1)
    @Column(name = "id")
    private Long id;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "email")
    private String email;

    @Column(name = "image_url")
    private String imageUrl;

    @UuidGenerator
    @Column(name = "public_id", nullable = false)
    private UUID publicId;

    @ManyToMany
    @JoinTable(name = "user_authority",
            joinColumns = {@JoinColumn(name = "user_id", referencedColumnName = "id")},
            inverseJoinColumns = {@JoinColumn(name = "authority_name", referencedColumnName = "name")})
    private Set<Authority> authorities = new HashSet<>();

    // Explicitly implement the abstract getId() method from AbstractAuditingEntity
    @Override
    public Long getId() {
        return this.id;
    }
}
