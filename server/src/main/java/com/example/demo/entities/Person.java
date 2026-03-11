package com.example.demo.entities;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

/**
 * @author CYTech Student
 *
 */
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
// @SuppressWarnings("serial")
@Document(collection = "persons")
public class Person implements Serializable {
    @Id
    @JsonProperty("id")
    @Indexed(unique = true)
    private String id;
    @JsonProperty("name")
    private String name;

    private String firstname;
    private String lastname;

    @JsonProperty("gender")
    private String gender;

    @JsonProperty("email")
    @Indexed(unique = true)
    private String email;

    private String password;

    @JsonProperty("role")
    private String role;

    @JsonProperty("pids")
    private List<String> partner;

    @JsonProperty("mid")
    private String mother;

    @JsonProperty("fid")
    private String father;

    @JsonProperty("bdate")
    private String date;

    // @JsonProperty("img")
    private String photo;

    @JsonProperty("mem")
    private List<String> memories;

    @JsonProperty("status")
    private String status;

    @JsonProperty("desc")
    private String description;

    public Person() {
        super();
        this.partner = new ArrayList<>();
        this.memories = new ArrayList<>();
        this.role = "USER";
    }

    public Person(Person person) {
        super();
        this.id = person.id;
        this.name = person.firstname + " " + person.lastname;
        this.firstname = person.firstname;
        this.lastname = person.lastname;
        this.gender = person.gender;
        this.email = person.email;
        // if (person.password != null) {
        this.password = person.password;
        // }
        this.role = person.role;
        this.mother = person.mother;
        this.father = person.father;
        this.partner = person.partner;
        this.date = person.date;
        this.photo = person.photo;
        this.memories = person.memories;
        this.status = person.status;
        this.description = person.description;
    }

    public Person(String firstname, String email) {
        super();
        this.firstname = firstname;
        this.name = this.firstname + " " + this.lastname;
        this.email = email;
        this.mother = this.firstname + " " + this.email + " " + "Mother";
        this.father = this.firstname + " " + this.email + " " + "Father";
        this.partner = new ArrayList<>();
        this.memories = new ArrayList<>();
        this.role = "USER";
    }

    public Person(String firstname, String email, String password) {
        super();
        this.firstname = firstname;
        this.name = firstname;
        this.email = email;
        this.password = password;
        this.mother = this.firstname + " " + this.email + " " + "Mother";
        this.father = this.firstname + " " + this.email + " " + "Father";
        this.partner = new ArrayList<>();
        this.memories = new ArrayList<>();
        this.role = "USER";
    }

    public Person(String firstname, String lastname, String gender, String email, String date) {
        this.name = firstname + " " + lastname;
        this.firstname = firstname;
        this.lastname = lastname;
        this.gender = gender;
        this.email = email;
        this.partner = new ArrayList<>();
        this.memories = new ArrayList<>();
        this.date = date;
        this.role = "USER";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<String> getPartner() {
        return partner;
    }

    public void setPartner(List<String> partner) {
        this.partner = partner == null ? new ArrayList<>() : partner;
    }

    public String getMother() {
        return mother;
    }

    public void setMother(String mother) {
        this.mother = mother;
    }

    public String getFather() {
        return father;
    }

    public void setFather(String father) {
        this.father = father;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public List<String> getMemories() {
        return memories;
    }

    public void setMemories(List<String> memories) {
        this.memories = memories == null ? new ArrayList<>() : memories;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
