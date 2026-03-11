package com.example.demo.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dao.PersonRepository;
import com.example.demo.entities.Person;

import jakarta.annotation.PostConstruct;

@Service
public class PersonService {
    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private JavaMailSender emailSender;

    public List<Person> getAllPersons() {
	return personRepository.findAll();
    }

    public Person getPersonById(String id) {
	return personRepository.findById(id).orElse(null);
    }

    public Person updatePerson(Person personDetails) {
	if (personDetails.getFirstname() != null && personDetails.getLastname() != null) {
	    personDetails.setName(personDetails.getFirstname() + " " + personDetails.getLastname());
	}
	return personRepository.save(personDetails);
    }

    // To Update many persons
    public Person updateDataBase(Person person) {
	Person personToUpdate = new Person(person);
	return updatePerson(personToUpdate);
    }

    public Person createPerson(Person person) {
	Person newPerson = new Person(person);
	newPerson.setId(null);
	if (newPerson.getFirstname() != null && newPerson.getLastname() != null) {
	    newPerson.setName(newPerson.getFirstname() + " " + newPerson.getLastname());
	}
	return personRepository.save(newPerson);
    }

    public Person getPersonByEmail(String email) {
	if (email == null || email.isBlank()) {
	    return null;
	}
	return personRepository.findByEmail(email);
    }

    public Person getPersonByEmailAndPassword(String email, String password) {
	return personRepository.findByEmailAndPassword(email, password);
    }

    public Person deletePerson(String id) {
	Person person = getPersonById(id);
	if (person == null) {
	    return null;
	}
	if (person.getPassword() == null || person.getPassword().isBlank()) {
	    personRepository.deleteById(id);
	}
	return person;
    }

    public List<Person> getAllPersonsFiltered() {
	List<Person> allPersons = getAllPersons();
	List<Person> filteredPersons = new ArrayList<>();

	for (Person person : allPersons) {
	    if (person.getMother() == null) {
		person.setMother(null);
	    }
	    if (person.getFather() == null) {
		person.setFather(null);
	    }
	    if (person.getPartner() == null || person.getPartner().isEmpty()) {
		person.setPartner(null);
	    }
	    filteredPersons.add(person);
	}

	return filteredPersons;
    }

    public ResponseEntity<Map<String, String>> sendEmail(Person initiator, Person person) {
	SimpleMailMessage message = new SimpleMailMessage();
	if (initiator == null) {
	    Map<String, String> response = new HashMap<>();
	    response.put("error", "Email initiator is missing.");
	    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}
	if (person == null || person.getEmail() == null || person.getEmail().isBlank()) {
	    Map<String, String> response = new HashMap<>();
	    response.put("error", "Recipient email is missing.");
	    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}
	message.setTo(person.getEmail());
	message.setSubject("Adding Notification");
	message.setText("Dear " + person.getFirstname() + ",\n\nYou've been added as a family member of: "
		+ initiator.getFirstname() + " " + initiator.getLastname() + " : " + initiator.getEmail()
		+ "\n\nPlease, contact him or follow the link to create you own Genea-Logical-Tree.\n\nBest regards,\nGENEA team");
	Map<String, String> response = new HashMap<>();
	try {
	    emailSender.send(message);
	    response.put("message",
		    "Email sent to " + person.getFirstname() + " " + person.getLastname() + " : " + person.getEmail());
	    return ResponseEntity.ok(response);
	} catch (Exception e) {
	    response.put("error", "Error during mail sending: " + e.getMessage());
	    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	}
    }

    public Set<Person> getFamily(String id) {
	Set<Person> family = new HashSet<>();
	Person person = getPersonById(id);
	if (person != null) {
//	    family.add(person);
	    addParentsToFamily(person, family);
	    addPartnerToFamily(person, family);
	    addSiblingsToFamily(person, family);
	    addChildrenToFamily(person, family);
	}
	return family;
    }

    public List<Person> getSiblings(String personId) {
	Person person = getPersonById(personId);
	if (person == null) {
	    throw new IllegalArgumentException("Person not found");
	}

	String motherId = person.getMother();
	String fatherId = person.getFather();

	if (!(motherId == null || fatherId == null)) {
//	    throw new IllegalArgumentException("Mother or father is undefined");
	    List<Person> allPersons = getAllPersons().stream().filter(p -> !p.getId().equals(personId)
		    && motherId.equals(p.getMother()) && fatherId.equals(p.getFather())).collect(Collectors.toList());
	    allPersons.add(person);
	    return allPersons;
	} else {
	    List<Person> allPersons = new ArrayList<Person>();
	    allPersons.add(person);
	    return allPersons;
	}

    }

    public void getPersonsByAttribute(String attributeValue) {
	List<Person> allPersons = getAllPersons();
	List<String> newPartners = new ArrayList<>();

	for (Person person : allPersons) {
	    if (person.getMother() != null && person.getMother().equals(attributeValue)) {
		person.setMother(attributeValue);
		updateDataBase(person);
	    }
	    if (person.getFather() != null && person.getFather().equals(attributeValue)) {
		person.setFather(attributeValue);
		updateDataBase(person);
	    }
	    if (person.getPartner() != null) {
		for (String partner : person.getPartner()) {
		    if (partner.equals(attributeValue)) {
			partner = attributeValue;
			newPartners.add(partner);
		    }
		}
		person.setPartner(newPartners);
	    }
	}

    }

    private void addParentsToFamily(Person person, Set<Person> family) {
	if (person.getMother() != null) {
	    Person mother = getPersonById(person.getMother());
	    if (mother != null && !family.contains(mother)) {
		family.add(mother);
		addParentsToFamily(mother, family);
	    }
	}
	if (person.getFather() != null) {
	    Person father = getPersonById(person.getFather());
	    if (father != null && !family.contains(father)) {
		family.add(father);
		addParentsToFamily(father, family);
	    }
	}
    }

    private void addPartnerToFamily(Person person, Set<Person> family) {
	if (person.getPartner() != null && !person.getPartner().isEmpty()) {
	    for (String partnerId : person.getPartner()) {
		Person partner = getPersonById(partnerId);
		if (partner != null && !family.contains(partner)) {
		    family.add(partner);
		}
	    }
	}
    }

    private void addSiblingsToFamily(Person person, Set<Person> family) {
	List<Person> siblings = getSiblings(person.getId());
	family.addAll(siblings);
    }

    private void addChildrenToFamily(Person person, Set<Person> family) {
	List<Person> children = personRepository.findByMotherOrFather(person.getId(), person.getId());
	for (Person child : children) {
	    if (!family.contains(child)) {
		family.add(child);
	    }
	}
    }

    @PostConstruct
    @Transactional
    public void init() {
	// Check if the database is already initialized
	if (personRepository.count() == 0) {
	    // Your initialization code here...
	    // Create the Person objects
	    Person gaelle = new Person("Gaelle", "Kamve", "female", "porttitor.interdum@hotmail.com", "20-05-1989");
	    Person yvan = new Person("Yvan", "Carel", "male", "yvancarel@mail.com", "04-02-1995");
	    Person rolain = new Person("Rolain", "Parnell", "male", "mus.aenean@hotmail.edu", "15-11-1997");
	    Person andy = new Person("Andy", "Jardel", "male", "nec@yahoo.net", "01-10-2003");
	    Person cheryle = new Person("Chéryle", "Marcelle", "female", "mus.aenean@hotmail.edu", "13-07-2005");
	    Person hortense = new Person("Hortense", "Murielle", "female", "arcu.nunc@protonmail.net", "20-01-1976");
	    Person marcel = new Person("Marcel", "Delaure", "male", "ligula.elit.pretium@aol.edu", "15-08-1965");
//	    Person jean = new Person("Jean", "Ven", "male", "arcu.nunc@protonmail.net", "01-01-1935");
//	    Person marie = new Person("Marie", "Laurence","female", "ligula.elit.pretium@aol.edu", "01-01-1943");

	    // Save the Person objects to the database
	    yvan.setPassword("YvanCarel");
	    gaelle = personRepository.save(gaelle);
	    yvan = personRepository.save(yvan);
	    rolain = personRepository.save(rolain);
	    andy = personRepository.save(andy);
	    cheryle = personRepository.save(cheryle);
	    hortense = personRepository.save(hortense);
	    marcel = personRepository.save(marcel);
//	    jean = personRepository.save(jean);
//	    marie = personRepository.save(marie);

	    marcel.getPartner().add(hortense.getId());
	    hortense.getPartner().add(marcel.getId());
//	    jean.getPartner().add(marie.getId());
//	    marie.getPartner().add(jean.getId());

	    // Save the updated parents to the database
	    hortense = personRepository.save(hortense);
	    marcel = personRepository.save(marcel);
//	    jean = personRepository.save(jean);
//	    marie = personRepository.save(marie);

	    // Set the motherId and fatherId for the children
	    gaelle.setMother(hortense.getId());
	    gaelle.setFather(marcel.getId());
	    yvan.setMother(hortense.getId());
	    yvan.setFather(marcel.getId());
	    rolain.setMother(hortense.getId());
	    rolain.setFather(marcel.getId());
	    andy.setMother(hortense.getId());
	    andy.setFather(marcel.getId());
	    cheryle.setMother(hortense.getId());
	    cheryle.setFather(marcel.getId());

	    // Save the updated children to the database
	    gaelle = personRepository.save(gaelle);
	    yvan = personRepository.save(yvan);
	    rolain = personRepository.save(rolain);
	    andy = personRepository.save(andy);
	    cheryle = personRepository.save(cheryle);

	    // Save the updated parents to the database
	    hortense = personRepository.save(hortense);
	    marcel = personRepository.save(marcel);

	    // Set the motherId and fatherId for Hortense and Marcel
//	    hortense.setMother(marie.getId());
//	    hortense.setFather(jean.getId());

	    // Save the updated Hortense and Marcel to the database
	    hortense = personRepository.save(hortense);
	    marcel = personRepository.save(marcel);

	    // Save the updated Jean and Marie to the database
//	    jean = personRepository.save(jean);
//	    marie = personRepository.save(marie);

	    // Create the Person objects
	    Person child1 = new Person("Child1", "FamilyName", "gender", "child1@email.com", "01-01-2010");
	    Person child2 = new Person("Child2", "FamilyName", "gender", "child2@email.com", "01-01-2012");
	    Person child3 = new Person("Child3", "FamilyName", "gender", "child3@email.com", "01-01-2014");
	    Person mother = new Person("Mother", "FamilyName", "female", "mother@email.com", "01-01-1980");
	    Person father = new Person("Father", "FamilyName", "male", "father@email.com", "01-01-1980");
	    Person grandMother = new Person("GrandMother", "FamilyName", "female", "grandmother@email.com",
		    "01-01-1960");
	    Person grandFather = new Person("GrandFather", "FamilyName", "male", "grandfather@email.com", "01-01-1960");

	    // Save the Person objects to the database
	    child1 = personRepository.save(child1);
	    child2 = personRepository.save(child2);
	    child3 = personRepository.save(child3);
	    mother = personRepository.save(mother);
	    father = personRepository.save(father);
	    grandMother = personRepository.save(grandMother);
	    grandFather = personRepository.save(grandFather);

	    // Set partners
	    mother.getPartner().add(father.getId());
	    father.getPartner().add(mother.getId());
	    grandMother.getPartner().add(grandFather.getId());
	    grandFather.getPartner().add(grandMother.getId());

	    // Save the updated parents to the database
	    mother = personRepository.save(mother);
	    father = personRepository.save(father);
	    grandMother = personRepository.save(grandMother);
	    grandFather = personRepository.save(grandFather);

	    // Set the motherId and fatherId for the children
	    child1.setMother(mother.getId());
	    child1.setFather(father.getId());
	    child2.setMother(mother.getId());
	    child2.setFather(father.getId());
	    child3.setMother(mother.getId());
	    child3.setFather(father.getId());

	    // Save the updated children to the database
	    child1 = personRepository.save(child1);
	    child2 = personRepository.save(child2);
	    child3 = personRepository.save(child3);

	    // Set the motherId and fatherId for the parents
	    mother.setMother(grandMother.getId());
	    mother.setFather(grandFather.getId());
//	    father.setMother(grandMother.getId());
//	    father.setFather(grandFather.getId());

	    // Save the updated parents to the database
	    mother = personRepository.save(mother);
//	    father = personRepository.save(father);
	}
    }
}
