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
      'nav.language': 'Français',
      'nav.languageHint': 'Switch to French',
      'nav.theme': 'Dark Theme',
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
      'login.title': 'GENEA',
      'login.subtitle': 'Genealogy platform',
      'login.signIn': 'Sign in',
      'login.signUp': 'Create account',
      'login.reset': 'Reset password',
      'login.email': 'Email',
      'login.password': 'Password',
      'login.confirmPassword': 'Confirm password',
      'login.firstName': 'First name',
      'login.submitSignIn': 'Sign in',
      'login.submitSignUp': 'Create account',
      'login.submitReset': 'Update password',
      'login.goReset': 'Forgot password?',
      'login.goBack': 'Back to login',
      'login.switchSignup': 'Need an account?',
      'login.switchSignin': 'Already have an account?',
      'login.invalidCredentials': 'Invalid email or password.',
      'login.userExists': 'This user already exists.',
      'login.userCreated': 'User created. You can now sign in.',
      'login.resetSuccess': 'Password updated. You can sign in now.',
      'login.resetError': 'Unable to reset password. Check the email.',
      'login.passwordMismatch': 'Passwords do not match.',
      'login.required': 'This field is required.',
      'login.language': 'Français',
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
      'nav.theme': 'Theme sombre',
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
      'home.quickOne': "Ouvrez Arbre pour voir votre genealogie par defaut.",
      'home.quickTwo': 'Utilisez Souvenirs pour ajouter des images.',
      'home.quickThree': 'Les admins peuvent ouvrir Equipe et voir tous les arbres.',
      'login.title': 'GENEA',
      'login.subtitle': 'Plateforme genealogique',
      'login.signIn': 'Connexion',
      'login.signUp': 'Creer un compte',
      'login.reset': 'Reinitialiser le mot de passe',
      'login.email': 'Email',
      'login.password': 'Mot de passe',
      'login.confirmPassword': 'Confirmer le mot de passe',
      'login.firstName': 'Prenom',
      'login.submitSignIn': 'Se connecter',
      'login.submitSignUp': 'Creer',
      'login.submitReset': 'Mettre a jour',
      'login.goReset': 'Mot de passe oublie ?',
      'login.goBack': 'Retour connexion',
      'login.switchSignup': 'Besoin dun compte ?',
      'login.switchSignin': 'Deja inscrit ?',
      'login.invalidCredentials': 'Email ou mot de passe invalide.',
      'login.userExists': 'Cet utilisateur existe deja.',
      'login.userCreated': 'Utilisateur cree. Vous pouvez vous connecter.',
      'login.resetSuccess': 'Mot de passe mis a jour. Connectez-vous.',
      'login.resetError': "Impossible de reinitialiser. Verifiez l'email.",
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
