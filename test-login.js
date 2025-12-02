// Script de teste para o endpoint de login
// Usando fetch diretamente para testar sem o proxy do Vite

async function testarLogin() {
    console.log('🔐 Testando endpoint de login...\n');
    
    const API_URL = 'http://localhost:5268/api';
    const credentials = {
        email: 'testeM@gmail.com',
        senha: '@Natal25'
    };
    
    console.log('📤 Enviando credenciais:');
    console.log(JSON.stringify(credentials, null, 2));
    console.log(`\n🌐 URL: ${API_URL}/Auth/login`);
    console.log('\n⏳ Aguardando resposta...\n');
    
    try {
        const response = await fetch(`${API_URL}/Auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        
        console.log(`📡 Status HTTP: ${response.status} ${response.statusText}\n`);
        
        const result = await response.json();
        
        console.log('📥 Resposta recebida:');
        console.log(JSON.stringify(result, null, 2));
        
        if (response.ok && result.success) {
            console.log('\n✅ Login bem-sucedido!');
            if (result.data?.token) {
                console.log('🔑 Token recebido:', result.data.token.substring(0, 50) + '...');
                console.log('👤 Usuário:', result.data.nome);
                console.log('📧 Email:', result.data.email);
                console.log('👨‍🚀 Tipo:', result.data.tipo_usuario);
            }
        } else {
            console.log('\n❌ Falha no login');
            console.log('Erro:', result.message || result.error);
        }
    } catch (error) {
        console.error('\n💥 Erro ao fazer requisição:');
        console.error(error.message);
        console.error('\n⚠️  Certifique-se de que a API está rodando em http://localhost:5268');
    }
}

testarLogin();
