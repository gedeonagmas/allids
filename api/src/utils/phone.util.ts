export function normalizePhoneNumber(phone: string): string {
    let clean = phone.trim().replace(/\s+/g, '');
    
    // Remove leading + if it's already there to handle it consistently
    if (clean.startsWith('+')) {
        clean = clean.substring(1);
    }

    // Ethiopian Local (09... or 07...) -> +251...
    if (clean.startsWith('09') || clean.startsWith('07')) {
        return '+251' + clean.substring(1);
    }

    // Already has country code 251... -> +251...
    if (clean.startsWith('251')) {
        return '+' + clean;
    }

    // Default: just prepend + if not there
    return '+' + clean;
}
