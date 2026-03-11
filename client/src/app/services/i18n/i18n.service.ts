import { Injectable } from '@angular/core';

type Language = 'en' | 'fr';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly languageStorageKey = 'GeneaLanguage';

  private readonly translations: Record<Language, Record<string, string>> = {
    en: {
      'nav.home': 'Home',
      'nav.profile': 'Profile',
      'nav.family': 'Family',
      'nav.tree': 'Tree',
      'nav.memories': 'Memories',
      'nav.team': 'Team',
      'nav.language': 'Francais',
      'nav.languageHint': 'Switch to French',
      'nav.themeDark': 'Dark Theme',
      'nav.themeLight': 'Light Theme',
      'nav.themeHint': 'Toggle light/dark theme',
      'nav.signOut': 'Sign Out',
      'nav.admin': 'Admin View',
      'nav.user': 'User View',

      'home.welcome': 'Welcome, {{name}}',
      'home.subtitle': 'Build, preserve and explore your family history in one place.',
      'home.card.users': 'Registered users',
      'home.card.memories': 'Shared memories',
      'home.card.males': 'Men',
      'home.card.females': 'Women',
      'home.story': 'Story workspace',
      'home.storyText': 'Create small and long trees, enrich profiles with photos, and keep your genealogy synchronized.',
      'home.quickStart': 'Quick start',
      'home.quickOne': 'Open Tree to view your default genealogy.',
      'home.quickTwo': 'Use Memories to add image memories.',
      'home.quickThree': 'Admins can open Team and all trees.',

      'tree.title': 'Family Tree Workspace',
      'tree.adminScope': 'Admin mode: all trees are visible.',
      'tree.userScope': 'User mode: only your own family tree is visible.',
      'tree.empty': 'No tree data available for this account.',

      'family.title': 'Family Book',
      'family.subtitle': 'Members linked to your genealogy scope.',
      'family.firstName': 'First name',
      'family.lastName': 'Last name',
      'family.gender': 'Gender',
      'family.email': 'Email',
      'family.birthDate': 'Birth date',
      'family.empty': 'No family data available yet.',

      'memories.title': 'Memories',
      'memories.subtitle': 'Upload and browse family photos grouped by member.',
      'memories.uploadLabel': 'Upload a memory',
      'memories.empty': 'No members available for memories.',
      'memories.emptyPerson': 'No memory for this member yet.',

      'team.title': 'Team',
      'team.subtitle': 'Administrative and collaboration accounts.',
      'team.noDescription': 'No description provided.',
      'team.empty': 'No team members found.',

      'profile.title': 'Security Profile',
      'profile.subtitle': 'Update your account password safely.',
      'profile.oldPassword': 'Old password',
      'profile.newPassword': 'New password',
      'profile.confirmPassword': 'Confirm new password',
      'profile.submit': 'Update password',
      'profile.required': 'This field is required.',
      'profile.oldPasswordInvalid': 'Old password is incorrect.',
      'profile.passwordMismatch': 'New passwords do not match.',
      'profile.userMissing': 'Session user not found. Please login again.',
      'profile.updated': 'Password updated successfully.',
      'profile.updateError': 'Unable to update password.',

      'login.title': 'GENEA',
      'login.subtitle': 'Genealogy platform',
      'login.createAccount': 'Create Account',
      'login.registerHint': 'Use your email account for registration.',
      'login.signIn': 'Sign In',
      'login.signInHint': 'Use your account to continue.',
      'login.signUp': 'Sign Up',
      'login.reset': 'Reset Password',
      'login.resetHint': 'Set a new password for your account.',
      'login.email': 'Email',
      'login.password': 'Password',
      'login.confirmPassword': 'Confirm password',
      'login.firstName': 'First name',
      'login.submitSignIn': 'SIGN IN',
      'login.submitSignUp': 'SIGN UP',
      'login.submitReset': 'UPDATE PASSWORD',
      'login.forgotPassword': 'Forgot password?',
      'login.goBack': 'Back to sign in',
      'login.welcomeBack': 'Welcome Back!',
      'login.welcomeBackDesc': 'To keep connected with us please sign in with your personal info.',
      'login.helloFriend': 'Hello, Friend!',
      'login.helloFriendDesc': 'Enter your personal details and start your genealogy journey.',
      'login.invalidCredentials': 'Invalid email or password.',
      'login.userExists': 'This user already exists.',
      'login.userCreated': 'User created. You can now sign in.',
      'login.resetSuccess': 'Password updated. You can sign in now.',
      'login.resetError': 'Unable to reset password. Check the email.',
      'login.passwordMismatch': 'Passwords do not match.',
      'login.required': 'This field is required.',
      'login.language': 'Francais',
      'login.languageHint': 'Switch to French'
    },
    fr: {
      'nav.home': 'Accueil',
      'nav.profile': 'Profil',
      'nav.family': 'Famille',
      'nav.tree': 'Arbre',
      'nav.memories': 'Souvenirs',
      'nav.team': 'Equipe',
      'nav.language': 'English',
      'nav.languageHint': 'Switch to English',
      'nav.themeDark': 'Theme sombre',
      'nav.themeLight': 'Theme clair',
      'nav.themeHint': 'Basculer theme clair/sombre',
      'nav.signOut': 'Deconnexion',
      'nav.admin': 'Vue admin',
      'nav.user': 'Vue utilisateur',

      'home.welcome': 'Bienvenue, {{name}}',
      'home.subtitle': 'Construisez, preservez et explorez votre histoire familiale au meme endroit.',
      'home.card.users': 'Utilisateurs inscrits',
      'home.card.memories': 'Souvenirs partages',
      'home.card.males': 'Hommes',
      'home.card.females': 'Femmes',
      'home.story': 'Espace genealogie',
      'home.storyText': 'Creez des petits et grands arbres, enrichissez les profils avec des photos et gardez votre genealogie synchronisee.',
      'home.quickStart': 'Demarrage rapide',
      'home.quickOne': 'Ouvrez Arbre pour voir votre genealogie par defaut.',
      'home.quickTwo': 'Utilisez Souvenirs pour ajouter des images.',
      'home.quickThree': 'Les admins peuvent ouvrir Equipe et voir tous les arbres.',

      'tree.title': 'Espace Arbre Genealogique',
      'tree.adminScope': 'Mode admin : tous les arbres sont visibles.',
      'tree.userScope': 'Mode utilisateur : seul votre arbre est visible.',
      'tree.empty': 'Aucune donnee darbre disponible pour ce compte.',

      'family.title': 'Livre de Famille',
      'family.subtitle': 'Membres lies a votre perimetre genealogique.',
      'family.firstName': 'Prenom',
      'family.lastName': 'Nom',
      'family.gender': 'Genre',
      'family.email': 'Email',
      'family.birthDate': 'Date de naissance',
      'family.empty': 'Aucune donnee familiale disponible.',

      'memories.title': 'Souvenirs',
      'memories.subtitle': 'Televersez et parcourez les photos de famille par membre.',
      'memories.uploadLabel': 'Ajouter un souvenir',
      'memories.empty': 'Aucun membre disponible pour les souvenirs.',
      'memories.emptyPerson': 'Aucun souvenir pour ce membre.',

      'team.title': 'Equipe',
      'team.subtitle': 'Comptes administratifs et collaboratifs.',
      'team.noDescription': 'Aucune description.',
      'team.empty': 'Aucun membre equipe trouve.',

      'profile.title': 'Profil de Securite',
      'profile.subtitle': 'Mettez a jour le mot de passe de votre compte.',
      'profile.oldPassword': 'Ancien mot de passe',
      'profile.newPassword': 'Nouveau mot de passe',
      'profile.confirmPassword': 'Confirmer le nouveau mot de passe',
      'profile.submit': 'Mettre a jour',
      'profile.required': 'Ce champ est requis.',
      'profile.oldPasswordInvalid': 'Ancien mot de passe incorrect.',
      'profile.passwordMismatch': 'Les nouveaux mots de passe ne correspondent pas.',
      'profile.userMissing': 'Utilisateur de session introuvable. Reconnectez-vous.',
      'profile.updated': 'Mot de passe mis a jour avec succes.',
      'profile.updateError': 'Impossible de mettre a jour le mot de passe.',

      'login.title': 'GENEA',
      'login.subtitle': 'Plateforme genealogique',
      'login.createAccount': 'Creer un compte',
      'login.registerHint': 'Utilisez votre email pour vous inscrire.',
      'login.signIn': 'Connexion',
      'login.signInHint': 'Utilisez votre compte pour continuer.',
      'login.signUp': 'Inscription',
      'login.reset': 'Reinitialiser le mot de passe',
      'login.resetHint': 'Definissez un nouveau mot de passe pour votre compte.',
      'login.email': 'Email',
      'login.password': 'Mot de passe',
      'login.confirmPassword': 'Confirmer le mot de passe',
      'login.firstName': 'Prenom',
      'login.submitSignIn': 'SE CONNECTER',
      'login.submitSignUp': 'S INSCRIRE',
      'login.submitReset': 'METTRE A JOUR',
      'login.forgotPassword': 'Mot de passe oublie ?',
      'login.goBack': 'Retour connexion',
      'login.welcomeBack': 'Bon retour !',
      'login.welcomeBackDesc': 'Pour rester connecte, connectez-vous avec vos informations personnelles.',
      'login.helloFriend': 'Bonjour !',
      'login.helloFriendDesc': 'Entrez vos informations et commencez votre parcours genealogique.',
      'login.invalidCredentials': 'Email ou mot de passe invalide.',
      'login.userExists': 'Cet utilisateur existe deja.',
      'login.userCreated': 'Utilisateur cree. Vous pouvez vous connecter.',
      'login.resetSuccess': 'Mot de passe mis a jour. Connectez-vous.',
      'login.resetError': 'Impossible de reinitialiser. Verifiez l email.',
      'login.passwordMismatch': 'Les mots de passe ne correspondent pas.',
      'login.required': 'Ce champ est requis.',
      'login.language': 'English',
      'login.languageHint': 'Switch to English'
    }
  };

  get currentLanguage(): Language {
    const stored = localStorage.getItem(this.languageStorageKey);
    return stored === 'fr' ? 'fr' : 'en';
  }

  setLanguage(language: Language): void {
    localStorage.setItem(this.languageStorageKey, language);
  }

  toggleLanguage(): Language {
    const next = this.currentLanguage === 'en' ? 'fr' : 'en';
    this.setLanguage(next);
    return next;
  }

  t(key: string, params?: Record<string, string | number>): string {
    const value = this.translations[this.currentLanguage][key] ?? this.translations.en[key] ?? key;

    if (!params) {
      return value;
    }

    return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
      return acc.replaceAll(`{{${paramKey}}}`, String(paramValue));
    }, value);
  }
}
