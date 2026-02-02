const mkcert = require('mkcert');
const fs = require('fs');
const path = require('path');

async function generateCerts() {
    try {
        // Create certificate authority
        const ca = await mkcert.createCA({
            organization: 'Jarvis AI Local',
            countryCode: 'US',
            state: 'California',
            locality: 'Local',
            validityDays: 365
        });

        // Create certificate for localhost
        const cert = await mkcert.createCert({
            domains: ['localhost', '127.0.0.1', '::1'],
            validityDays: 365,
            caKey: ca.key,
            caCert: ca.cert
        });

        // Save certificates
        const certDir = path.join(__dirname, 'certs');
        if (!fs.existsSync(certDir)) {
            fs.mkdirSync(certDir, { recursive: true });
        }

        fs.writeFileSync(path.join(certDir, 'localhost.key'), cert.key);
        fs.writeFileSync(path.join(certDir, 'localhost.crt'), cert.cert);
        fs.writeFileSync(path.join(certDir, 'ca.pem'), ca.cert);

        console.log('✅ SSL certificates generated successfully!');
        console.log('   Location: ' + certDir);
        console.log('   Files: localhost.key, localhost.crt, ca.pem');
        console.log('');
        console.log('   To trust these certificates:');
        console.log('   - macOS: sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain certs/ca.pem');
        console.log('   - Ubuntu: sudo cp certs/ca.pem /usr/local/share/ca-certificates/jarvis-local.crt && sudo update-ca-certificates');
        console.log('   - Or simply accept the warning in your browser');
        
    } catch (err) {
        console.error('Error generating certificates:', err);
        process.exit(1);
    }
}

generateCerts();