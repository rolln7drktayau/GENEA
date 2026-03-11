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
      'nav.signOut': 'Sign Out',
      'nav.language': 'Français',
      'nav.languageHint': 'Switch to French',
      'home.welcome': 'Welcome',
      'home.intro1': 'Welcome to GENEA, your dedicated space to build your family story.',
      'home.intro2': 'Discover intuitive tools and expert guidance to explore your genealogy and preserve a legacy for future generations.',
      'home.connections': 'Total connections: {{connections}}.',
      'home.people': '{{male}} men and {{female}} women have trusted us and contributed to {{memories}} memories on the platform.',
      'login.createAccount': 'Create Account',
      'login.registerHint': 'or use email for registration',
      'login.signIn': 'Sign In',
      'login.signInHint': 'or use your email account',
      'login.forgotPassword': 'Forgot your password?',
      'login.welcomeBack': 'Welcome Back!',
      'login.welcomeBackDesc': 'To stay connected with us, sign in with your personal info.',
      'login.helloFriend': 'Hello Friend!',
      'login.helloFriendDesc': 'Enter your personal details and start your journey with us.',
      'login.invalidCredentials': 'Invalid email or password.',
      'login.userExists': 'This user already exists. Please sign in.',
      'login.userCreated': 'User created successfully. You can now sign in.',
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
      'nav.signOut': 'Deconnexion',
      'nav.language': 'English',
      'nav.languageHint': 'Passer en anglais',
      'home.welcome': 'Bienvenue',
      'home.intro1': 'Bienvenue sur GENEA, votre espace dedie a la construction de votre histoire familiale.',
      'home.intro2': 'Decouvrez des outils intuitifs et des conseils pour explorer votre genealogie et transmettre un heritage durable.',
      'home.connections': 'Nombre total de connexions : {{connections}}.',
      'home.people': '{{male}} hommes et {{female}} femmes nous ont fait confiance et ont ajoute {{memories}} souvenirs sur la plateforme.',
      'login.createAccount': 'Creer un compte',
      'login.registerHint': "ou utilisez votre email pour l'inscription",
      'login.signIn': 'Se connecter',
      'login.signInHint': 'ou utilisez votre compte email',
      'login.forgotPassword': 'Mot de passe oublie ?',
      'login.welcomeBack': 'Bon retour !',
      'login.welcomeBackDesc': 'Pour rester connecte, connectez-vous avec vos informations personnelles.',
      'login.helloFriend': 'Bonjour !',
      'login.helloFriendDesc': 'Entrez vos informations personnelles et commencez votre parcours avec nous.',
      'login.invalidCredentials': 'Email ou mot de passe invalide.',
      'login.userExists': 'Cet utilisateur existe deja. Connectez-vous.',
      'login.userCreated': 'Utilisateur cree avec succes. Vous pouvez maintenant vous connecter.',
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
    const value =
      this.translations[this.currentLanguage][key] ??
      this.translations.en[key] ??
      key;

    if (!params) {
      return value;
    }

    return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
      return acc.replaceAll(`{{${paramKey}}}`, String(paramValue));
    }, value);
  }
}
