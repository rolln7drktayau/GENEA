package com.example.demo.services;

import java.util.ArrayList;
import java.util.Arrays;
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
    private static final String ADMIN_ROLE = "ADMIN";
    private static final String USER_ROLE = "USER";
    private static final List<String> TEMPLATE_TREE_ROOT_EMAILS = Arrays.asList("user.basic@genea.local",
	    "user.family@genea.local", "user.memories@genea.local", "user.tree@genea.local",
	    "user.guest@genea.local", "user.student@genea.local", "user.premium@genea.local",
	    "user.team1@genea.local", "user.team2@genea.local", "user.parent@genea.local",
	    "user.child@genea.local", "user.historian@genea.local", "user.genealogist@genea.local",
	    "user.mobile@genea.local", "user.desktop@genea.local", "user.invite@genea.local",
	    "user.readonly@genea.local", "user.archive@genea.local", "admin.ops@genea.local",
	    "admin.support@genea.local", "admin.audit@genea.local", "rct");

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
	Person existingPerson = null;
	if (personDetails.getId() != null && !personDetails.getId().isBlank()) {
	    existingPerson = getPersonById(personDetails.getId());
	}

	if (personDetails.getFirstname() != null && personDetails.getLastname() != null) {
	    personDetails.setName(personDetails.getFirstname() + " " + personDetails.getLastname());
	}

	if (existingPerson != null) {
	    personDetails.setRole(sanitizeRole(existingPerson.getRole()));
	} else {
	    personDetails.setRole(sanitizeRole(personDetails.getRole()));
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
	newPerson.setRole(USER_ROLE);
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
	    family.add(person);
	    addParentsToFamily(person, family);
	    addPartnerToFamily(person, family);
	    addSiblingsToFamily(person, family);
	    addChildrenToFamily(person, family);
	}
	return family;
    }

    public List<Person> getTreeDataByViewerId(String viewerId) {
	Person viewer = getPersonById(viewerId);
	if (viewer == null) {
	    return new ArrayList<>();
	}

	if (ADMIN_ROLE.equalsIgnoreCase(viewer.getRole())) {
	    return getAllPersonsFiltered();
	}

	Set<Person> family = getFamily(viewerId);
	family.add(viewer);
	return new ArrayList<>(family);
    }

    public ResponseEntity<Map<String, String>> resetPassword(String email, String newPassword) {
	Map<String, String> response = new HashMap<>();
	if (email == null || email.isBlank() || newPassword == null || newPassword.isBlank()) {
	    response.put("error", "Email and new password are required.");
	    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

	Person person = personRepository.findByEmail(email);
	if (person == null) {
	    response.put("error", "User not found.");
	    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	}

	person.setPassword(newPassword);
	personRepository.save(person);
	response.put("message", "Password has been updated.");
	return ResponseEntity.ok(response);
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
	    Person cheryle = new Person("Cheryle", "Marcelle", "female", "cheryle.marcelle@mail.com", "13-07-2005");
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

	ensureAdminAccount();
	ensureTestUserTemplates();
	ensureTemplateTreeData();
    }

    private void ensureAdminAccount() {
	Person admin = personRepository.findByEmail("rct");
	if (admin != null) {
	    admin.setPassword("rct");
	    admin.setRole(ADMIN_ROLE);
	    if (admin.getFirstname() == null || admin.getFirstname().isBlank()) {
		admin.setFirstname("Root");
	    }
	    if (admin.getLastname() == null || admin.getLastname().isBlank()) {
		admin.setLastname("Admin");
	    }
	    admin.setName(admin.getFirstname() + " " + admin.getLastname());
	    personRepository.save(admin);
	    return;
	}

	Person rootAdmin = new Person();
	rootAdmin.setFirstname("Root");
	rootAdmin.setLastname("Admin");
	rootAdmin.setName("Root Admin");
	rootAdmin.setGender("male");
	rootAdmin.setEmail("rct");
	rootAdmin.setPassword("rct");
	rootAdmin.setRole(ADMIN_ROLE);
	rootAdmin.setStatus("Team");
	personRepository.save(rootAdmin);
    }

    private void ensureTestUserTemplates() {
	upsertTemplateUser("user.basic@genea.local", "Basic123!", USER_ROLE, "Member", "male", "Basic", "User",
		"Standard user template");
	upsertTemplateUser("user.family@genea.local", "Family123!", USER_ROLE, "Member", "female", "Family", "Keeper",
		"Template focused on family data");
	upsertTemplateUser("user.memories@genea.local", "Memory123!", USER_ROLE, "Member", "female", "Memory", "Maker",
		"Template focused on memories");
	upsertTemplateUser("user.tree@genea.local", "Tree123!", USER_ROLE, "Member", "male", "Tree", "Builder",
		"Template focused on genealogy tree editing");
	upsertTemplateUser("user.guest@genea.local", "Guest123!", USER_ROLE, "Guest", "male", "Guest", "Visitor",
		"Guest-like user template");
	upsertTemplateUser("user.student@genea.local", "Student123!", USER_ROLE, "Student", "female", "Student", "Learner",
		"Learning user template");
	upsertTemplateUser("user.premium@genea.local", "Premium123!", USER_ROLE, "Premium", "female", "Premium", "Member",
		"Premium test template");
	upsertTemplateUser("user.team1@genea.local", "Team123!", USER_ROLE, "Team", "male", "Team", "Contributor",
		"Team member template");
	upsertTemplateUser("user.team2@genea.local", "TeamLead123!", USER_ROLE, "Team", "female", "Team", "Lead",
		"Team lead template");
	upsertTemplateUser("user.parent@genea.local", "Parent123!", USER_ROLE, "Parent", "female", "Parent", "Profile",
		"Parent profile template");
	upsertTemplateUser("user.child@genea.local", "Child123!", USER_ROLE, "Child", "male", "Child", "Profile",
		"Child profile template");
	upsertTemplateUser("user.historian@genea.local", "History123!", USER_ROLE, "Research", "male", "History", "Curator",
		"Historian template");
	upsertTemplateUser("user.genealogist@genea.local", "Genea123!", USER_ROLE, "Research", "female", "Genea",
		"Specialist", "Genealogist template");
	upsertTemplateUser("user.mobile@genea.local", "Mobile123!", USER_ROLE, "Mobile", "female", "Mobile", "Tester",
		"Mobile-first test template");
	upsertTemplateUser("user.desktop@genea.local", "Desktop123!", USER_ROLE, "Desktop", "male", "Desktop", "Tester",
		"Desktop-first test template");
	upsertTemplateUser("user.invite@genea.local", "Invite123!", USER_ROLE, "Invited", "female", "Invite", "Only",
		"Invitation flow template");
	upsertTemplateUser("user.readonly@genea.local", "Read123!", USER_ROLE, "ReadOnly", "male", "Read", "Only",
		"Read-only style template");
	upsertTemplateUser("user.archive@genea.local", "Archive123!", USER_ROLE, "Archived", "female", "Archive", "Tester",
		"Archived profile template");
	upsertTemplateUser("admin.ops@genea.local", "AdminOps123!", ADMIN_ROLE, "Team", "male", "Ops", "Admin",
		"Operations admin template");
	upsertTemplateUser("admin.support@genea.local", "Support123!", ADMIN_ROLE, "Team", "female", "Support", "Admin",
		"Support admin template");
	upsertTemplateUser("admin.audit@genea.local", "Audit123!", ADMIN_ROLE, "Team", "male", "Audit", "Admin",
		"Audit admin template");
    }

    private void ensureTemplateTreeData() {
	resetTemplateRootRelations();

	int templateIndex = 0;
	for (String rootEmail : TEMPLATE_TREE_ROOT_EMAILS) {
	    Person root = personRepository.findByEmail(rootEmail);
	    if (root == null) {
		continue;
	    }

	    int treeType = templateIndex % 3;
	    if (treeType == 0) {
		buildLongTemplateTree(root);
	    } else if (treeType == 1) {
		buildMediumTemplateTree(root);
	    } else {
		buildShortTemplateTree(root);
	    }
	    templateIndex++;
	}
    }

    private void resetTemplateRootRelations() {
	List<Person> rootsToReset = new ArrayList<>();
	for (String rootEmail : TEMPLATE_TREE_ROOT_EMAILS) {
	    Person root = personRepository.findByEmail(rootEmail);
	    if (root == null) {
		continue;
	    }
	    root.setMother(null);
	    root.setFather(null);
	    root.setPartner(new ArrayList<>());
	    rootsToReset.add(root);
	}

	if (!rootsToReset.isEmpty()) {
	    personRepository.saveAll(rootsToReset);
	}
    }

    private void buildLongTemplateTree(Person root) {
	Person mother = upsertRelativeForRoot(root, "mother", "Mother", "female");
	Person father = upsertRelativeForRoot(root, "father", "Father", "male");
	Person maternalGrandMother = upsertRelativeForRoot(root, "maternal-grand-mother", "MaternalGrandMother", "female");
	Person maternalGrandFather = upsertRelativeForRoot(root, "maternal-grand-father", "MaternalGrandFather", "male");
	Person paternalGrandMother = upsertRelativeForRoot(root, "paternal-grand-mother", "PaternalGrandMother", "female");
	Person paternalGrandFather = upsertRelativeForRoot(root, "paternal-grand-father", "PaternalGrandFather", "male");

	Person partner = upsertRelativeForRoot(root, "partner", "Partner", oppositeGender(root.getGender()));
	Person childOne = upsertRelativeForRoot(root, "child-one", "ChildOne", "female");
	Person childTwo = upsertRelativeForRoot(root, "child-two", "ChildTwo", "male");
	Person childOnePartner = upsertRelativeForRoot(root, "child-one-partner", "ChildOnePartner", "male");
	Person grandChild = upsertRelativeForRoot(root, "grand-child", "GrandChild", "female");

	linkPartners(maternalGrandMother.getEmail(), maternalGrandFather.getEmail());
	linkPartners(paternalGrandMother.getEmail(), paternalGrandFather.getEmail());

	linkParents(mother.getEmail(), maternalGrandMother.getEmail(), maternalGrandFather.getEmail());
	linkParents(father.getEmail(), paternalGrandMother.getEmail(), paternalGrandFather.getEmail());
	linkPartners(mother.getEmail(), father.getEmail());
	linkParents(root.getEmail(), mother.getEmail(), father.getEmail());

	linkPartners(root.getEmail(), partner.getEmail());
	linkChildToRootAndPartner(childOne.getEmail(), root, partner.getEmail());
	linkChildToRootAndPartner(childTwo.getEmail(), root, partner.getEmail());

	linkPartners(childOne.getEmail(), childOnePartner.getEmail());
	linkChildToRootAndPartner(grandChild.getEmail(), childOne, childOnePartner.getEmail());
    }

    private void buildMediumTemplateTree(Person root) {
	Person mother = upsertRelativeForRoot(root, "medium-mother", "MediumMother", "female");
	Person father = upsertRelativeForRoot(root, "medium-father", "MediumFather", "male");
	Person partner = upsertRelativeForRoot(root, "medium-partner", "MediumPartner", oppositeGender(root.getGender()));
	Person child = upsertRelativeForRoot(root, "medium-child", "MediumChild", "female");

	linkPartners(mother.getEmail(), father.getEmail());
	linkParents(root.getEmail(), mother.getEmail(), father.getEmail());

	linkPartners(root.getEmail(), partner.getEmail());
	linkChildToRootAndPartner(child.getEmail(), root, partner.getEmail());
    }

    private void buildShortTemplateTree(Person root) {
	Person partner = upsertRelativeForRoot(root, "short-partner", "ShortPartner", oppositeGender(root.getGender()));
	Person child = upsertRelativeForRoot(root, "short-child", "ShortChild", "male");

	linkPartners(root.getEmail(), partner.getEmail());
	linkChildToRootAndPartner(child.getEmail(), root, partner.getEmail());
    }

    private Person upsertRelativeForRoot(Person root, String nodeCode, String relationLabel, String gender) {
	String email = buildTemplateRelativeEmail(root.getEmail(), nodeCode);
	Person relative = personRepository.findByEmail(email);
	if (relative == null) {
	    relative = new Person();
	}

	String baseFirstName = root.getFirstname();
	if (baseFirstName == null || baseFirstName.isBlank()) {
	    baseFirstName = "Template";
	}

	String baseLastName = root.getLastname();
	if (baseLastName == null || baseLastName.isBlank()) {
	    baseLastName = "Family";
	}

	relative.setEmail(email);
	relative.setPassword("Template123!");
	relative.setRole(USER_ROLE);
	relative.setStatus("Template");
	relative.setGender(gender);
	relative.setFirstname(baseFirstName + relationLabel);
	relative.setLastname(baseLastName);
	relative.setName(relative.getFirstname() + " " + relative.getLastname());
	relative.setDescription("Auto-generated template tree node related to " + root.getEmail());
	relative.setMother(null);
	relative.setFather(null);
	relative.setPartner(new ArrayList<>());

	return personRepository.save(relative);
    }

    private String buildTemplateRelativeEmail(String rootEmail, String nodeCode) {
	String normalizedRoot = rootEmail.toLowerCase().replace("@", ".at.");
	normalizedRoot = normalizedRoot.replaceAll("[^a-z0-9.]+", ".");
	return "template." + normalizedRoot + "." + nodeCode + "@genea.local";
    }

    private String oppositeGender(String gender) {
	if ("female".equalsIgnoreCase(gender)) {
	    return "male";
	}
	if ("male".equalsIgnoreCase(gender)) {
	    return "female";
	}
	return "female";
    }

    private void linkChildToRootAndPartner(String childEmail, Person root, String partnerEmail) {
	if (root == null || root.getEmail() == null || partnerEmail == null) {
	    return;
	}

	if ("female".equalsIgnoreCase(root.getGender())) {
	    linkParents(childEmail, root.getEmail(), partnerEmail);
	    return;
	}

	linkParents(childEmail, partnerEmail, root.getEmail());
    }

    private void upsertTemplateUser(String email, String password, String role, String status, String gender,
	    String firstname, String lastname, String description) {
	Person templateUser = personRepository.findByEmail(email);
	if (templateUser == null) {
	    templateUser = new Person();
	}

	templateUser.setEmail(email);
	templateUser.setPassword(password);
	templateUser.setRole(sanitizeRole(role));
	templateUser.setStatus(status);
	templateUser.setGender(gender);
	templateUser.setFirstname(firstname);
	templateUser.setLastname(lastname);
	templateUser.setName(firstname + " " + lastname);
	templateUser.setDescription(description);

	personRepository.save(templateUser);
    }

    private void linkParents(String childEmail, String motherEmail, String fatherEmail) {
	Person child = personRepository.findByEmail(childEmail);
	Person mother = personRepository.findByEmail(motherEmail);
	Person father = personRepository.findByEmail(fatherEmail);

	if (child == null || mother == null || father == null) {
	    return;
	}

	child.setMother(mother.getId());
	child.setFather(father.getId());
	personRepository.save(child);
    }

    private void linkPartners(String firstEmail, String secondEmail) {
	Person first = personRepository.findByEmail(firstEmail);
	Person second = personRepository.findByEmail(secondEmail);

	if (first == null || second == null) {
	    return;
	}

	Set<String> firstPartners = new HashSet<>();
	if (first.getPartner() != null) {
	    firstPartners.addAll(first.getPartner());
	}
	firstPartners.add(second.getId());
	first.setPartner(new ArrayList<>(firstPartners));

	Set<String> secondPartners = new HashSet<>();
	if (second.getPartner() != null) {
	    secondPartners.addAll(second.getPartner());
	}
	secondPartners.add(first.getId());
	second.setPartner(new ArrayList<>(secondPartners));

	personRepository.saveAll(Arrays.asList(first, second));
    }

    private String sanitizeRole(String role) {
	if (ADMIN_ROLE.equalsIgnoreCase(role)) {
	    return ADMIN_ROLE;
	}
	return USER_ROLE;
    }
}
