# GrandSIP 📞

Um servidor WebSocket de alto desempenho para comunicação VoIP em tempo real, construído com PHP e Swoole.

## 🎯 Visão Geral

GrandSIP é uma plataforma completa de comunicação VoIP que combina servidor WebSocket, processamento de áudio em tempo real e interface web moderna. O projeto utiliza a extensão Swoole para fornecer comunicação assíncrona de alta performance e suporte a múltiplas conexões simultâneas.

### Principais Características

- **Servidor WebSocket assíncrono** com Swoole para comunicação em tempo real
- **Suporte a codecs de áudio** (BCG729, Opus, PSampler) para processamento VoIP
- **Interface web moderna** com dashboard para gerenciamento de chamadas
- **Sistema de plugins modular** para extensibilidade
- **Gerenciamento de campanhas** e filas de chamadas
- **Sistema de autenticação** e controle de acesso
- **Monitoramento em tempo real** de conexões e estatísticas

## 🛠️ Requisitos do Sistema

### Obrigatórios

- **PHP 8.0+** (recomendado 8.1 ou superior)
- **Extensão Swoole** 5.0+
- **SQLite3** ou PDO SQLite
- **Extensões PHP básicas**: `json`, `curl`, `mbstring`, `sockets`

### Opcionais (para funcionalidades avançadas)

- **BCG729** - Codec de áudio G.729
- **Opus** - Codec de áudio Opus
- **PSampler** - Processamento de amostras de áudio
- **OpenSSL** - Para conexões SSL/TLS

## 📦 Instalação

### 1. Dependências do Sistema (Ubuntu/Debian)

```bash
# Instalar PHP e extensões básicas
sudo apt update
sudo apt install -y php8.1 php8.1-dev php8.1-sqlite3 php8.1-curl php8.1-mbstring php8.1-json

# Instalar ferramentas de desenvolvimento
sudo apt install -y build-essential php-pear
```

### 2. Instalar Swoole

```bash
# Via PECL (recomendado)
sudo pecl install swoole

# Ou via compilação manual
git clone https://github.com/swoole/swoole-src.git
cd swoole-src
phpize
./configure
make && sudo make install
```

### 3. Configurar PHP

Adicione ao seu `php.ini`:
```ini
extension=swoole
memory_limit=2000M
max_input_vars=100000
```

### 4. Clonar e Configurar o Projeto

```bash
# Clonar o repositório
git clone <url-do-repositorio> grandsip
cd grandsip

# Dar permissões adequadas
chmod +x middleware.php
chmod -R 755 plugins/
```

## ⚙️ Configuração

### Arquivo Principal de Configuração

Edite `plugins/configInterface.json`:

```json
{
  "port": "443",        // Porta do servidor
  "host": "0.0.0.0",    // IP de bind
  "ssl": false,         // Habilitar SSL/TLS
  "serverSettings": {
    "worker_num": 1,                    // Número de workers
    "max_request": 20000000,           // Máximo de requisições
    "max_coroutine": 20000000,         // Máximo de corrotinas
    "enable_coroutine": true,          // Habilitar corrotinas
    "ssl_cert_file": "fullchain.pem",  // Certificado SSL
    "ssl_key_file": "privkey.pem"      // Chave privada SSL
  }
}
```

### Configuração SSL (Opcional)

Para habilitar SSL:

1. Coloque os certificados na raiz do projeto:
   - `fullchain.pem` - Certificado completo
   - `privkey.pem` - Chave privada

2. Configure no `configInterface.json`:
```json
{
  "ssl": true,
  "port": "443"
}
```

## 🚀 Execução

### Desenvolvimento

```bash
# Executar o servidor
php middleware.php
```

### Produção com Systemd

Crie `/etc/systemd/system/grandsip.service`:

```ini
[Unit]
Description=GrandSIP WebSocket Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/grandsip
ExecStart=/usr/bin/php middleware.php
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Habilitar e iniciar:
```bash
sudo systemctl enable grandsip
sudo systemctl start grandsip
sudo systemctl status grandsip
```

## 🏗️ Arquitetura do Projeto

```
grandsip/
├── middleware.php              # Servidor principal
├── c.php                      # Gerador de stubs para extensões
├── plugins/                   # Sistema de plugins
│   ├── configInterface.json   # Configurações
│   ├── autoload.php           # Autoloader de plugins
│   ├── Database/              # Camada de dados
│   ├── Extension/             # Extensões e utilitários
│   ├── Message/               # Handlers de mensagens
│   ├── OpenConnection/        # Gerenciamento de conexões
│   ├── Request/               # Roteamento e páginas
│   ├── Start/                 # Inicialização do servidor
│   └── Utils/                 # Utilitários gerais
├── css/                       # Estilos da interface
├── js/                        # JavaScript da interface
├── img/                       # Recursos visuais
└── sounds/                    # Arquivos de áudio
```

## 📱 Interface Web

Após iniciar o servidor, acesse:

- **Dashboard Principal**: `http://localhost:8080/dashboard`
- **Login**: `http://localhost:8080/login`
- **Callcenter**: `http://localhost:8080/callcenter`
- **Gerenciar Campanhas**: `http://localhost:8080/campaign`
- **Relatórios de Chamadas**: `http://localhost:8080/calls`

## 🔧 Desenvolvimento

### Adicionando Novos Plugins

1. Crie sua classe em `plugins/Extension/plugins/`:
```php
<?php
class MeuPlugin {
    public function executar() {
        // Sua lógica aqui
    }
}
```

2. Adicione o caminho no `configInterface.json`:
```json
{
  "autoload": [
    "Extension/plugins",
    "seu/novo/caminho"
  ]
}
```

### Sistema de Cache

```php
use plugins\Start\cache;

// Definir valor
cache::define('chave', 'valor');

// Obter valor
$valor = cache::get('chave');

// Configurações globais
$config = cache::global();
```

## 🐛 Solução de Problemas

### Servidor não inicia

```bash
# Verificar se Swoole está instalado
php -m | grep swoole

# Verificar logs de erro
tail -f /var/log/syslog | grep grandsip
```

### Problemas de conexão

```bash
# Verificar portas em uso
netstat -tulpn | grep :8080

# Testar conectividade
telnet localhost 8080
```

### Problemas de SSL

```bash
# Verificar certificados
openssl x509 -in fullchain.pem -text -noout
openssl rsa -in privkey.pem -check
```

## 🧪 Testes

```bash
# Testar WebSocket
wscat -c ws://localhost:8080

# Testar HTTP
curl -I http://localhost:8080/dashboard
```

## 📊 Monitoramento

O sistema fornece métricas em tempo real através de:

- Dashboard web com estatísticas de conexões
- Logs estruturados via journal do sistema
- Métricas de performance das corrotinas Swoole

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob uma licença personalizada. Consulte o arquivo LICENSE para detalhes.

## 🆘 Suporte

- **Issues**: Abra uma issue no repositório
- **Documentação**: Consulte os comentários no código
- **Comunidade**: Participe das discussões do projeto

---

**Desenvolvido com ❤️ para comunicações VoIP de alta performance**
