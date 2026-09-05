/**
 * CYBER ACADEMY - DATABASE.JS
 * IndexedDB + localStorage wrapper com SEED inicial
 */

const DB = {
    dbName: 'CyberAcademyDB',
    dbVersion: 1,
    db: null,

    /**
     * Inicializa o IndexedDB
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store para arquivos binários
                if (!db.objectStoreNames.contains('files')) {
                    db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    },

    /**
     * Salva um arquivo no IndexedDB
     */
    async saveFile(file, metadata = {}) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            
            const fileData = {
                file: file,
                name: file.name || 'arquivo',
                type: file.type || 'application/octet-stream',
                size: file.size || 0,
                ...metadata,
                createdAt: new Date().toISOString()
            };

            const request = store.add(fileData);
            
            request.onsuccess = () => resolve({ id: request.result, ...fileData });
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Recupera um arquivo do IndexedDB
     */
    async getFile(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.get(parseInt(id));

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Deleta um arquivo do IndexedDB
     */
    async deleteFile(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            const request = store.delete(parseInt(id));

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Lista todos os arquivos
     */
    async listFiles() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
};

/**
 * localStorage wrapper para dados estruturados
 */
const Storage = {
    prefix: 'ca_',

    get(key) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

/**
 * Gerenciador de Dados da Aplicação
 */
const DataManager = {
    /**
     * Seed inicial com usuários demo e trilhas
     */
    async seed() {
        // Usuários demo
        const usuarios = Storage.get('usuarios') || [];
        if (usuarios.length === 0) {
            const demoUsers = [
                {
                    id: 1,
                    nome: 'Aluno Demo',
                    email: 'aluno@cyberacademy.com',
                    senha: 'aluno123',
                    perfil: 'aluno',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    nome: 'Professor Admin',
                    email: 'admin@cyberacademy.com',
                    senha: 'admin123',
                    perfil: 'professor',
                    createdAt: new Date().toISOString()
                }
            ];
            Storage.set('usuarios', demoUsers);
            console.log('Demo users seeded');
        }

        // Trilhas
        const trilhas = Storage.get('trilhas') || [];
        if (trilhas.length === 0) {
            const demoTrilhas = [
                {
                    id: 1,
                    titulo: 'Ferramentas do Dev',
                    descricao: 'Domine as ferramentas essenciais para desenvolvimento moderno. Aprenda Git, GitHub, Vercel e crie seu primeiro projeto profissional.',
                    preco: 197.00,
                    duracao: '~20h',
                    totalAulas: 32,
                    totalModulos: 4,
                    imagem: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
                    modulos: [
                        {
                            id: 1,
                            titulo: 'Git & Versionamento',
                            aulas: [
                                { id: 1, titulo: 'Introdução ao Git', duracao: '15min', tipo: 'video', videoUrl: '' },
                                { id: 2, titulo: 'Instalação e Configuração', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 3, titulo: 'Comandos Básicos', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 4, titulo: 'Branches e Merges', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 5, titulo: 'Resolvendo Conflitos', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 6, titulo: 'Git Flow', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 7, titulo: 'Tags e Releases', duracao: '15min', tipo: 'video', videoUrl: '' },
                                { id: 8, titulo: 'Prática: Primeiro Repositório', duracao: '45min', tipo: 'pratica', videoUrl: '' }
                            ]
                        },
                        {
                            id: 2,
                            titulo: 'GitHub na Prática',
                            aulas: [
                                { id: 9, titulo: 'Criando Conta no GitHub', duracao: '10min', tipo: 'video', videoUrl: '' },
                                { id: 10, titulo: 'Repositórios Remotos', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 11, titulo: 'Pull Requests', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 12, titulo: 'Code Review', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 13, titulo: 'GitHub Actions', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 14, titulo: 'GitHub Pages', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 15, titulo: 'Projetos Open Source', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 16, titulo: 'Prática: Contribuindo em Projetos', duracao: '60min', tipo: 'pratica', videoUrl: '' }
                            ]
                        },
                        {
                            id: 3,
                            titulo: 'Deploy com Vercel',
                            aulas: [
                                { id: 17, titulo: 'Introdução à Vercel', duracao: '15min', tipo: 'video', videoUrl: '' },
                                { id: 18, titulo: 'Conectando GitHub', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 19, titulo: 'Deploy Automático', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 20, titulo: 'Variáveis de Ambiente', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 21, titulo: 'Domínios Customizados', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 22, titulo: 'Preview Deployments', duracao: '15min', tipo: 'video', videoUrl: '' },
                                { id: 23, titulo: 'Analytics e Performance', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 24, titulo: 'Prática: Deploy do Seu Projeto', duracao: '45min', tipo: 'pratica', videoUrl: '' }
                            ]
                        },
                        {
                            id: 4,
                            titulo: 'Projeto Final',
                            aulas: [
                                { id: 25, titulo: 'Planejamento do Projeto', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 26, titulo: 'Configuração do Ambiente', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 27, titulo: 'Desenvolvimento Parte 1', duracao: '45min', tipo: 'video', videoUrl: '' },
                                { id: 28, titulo: 'Desenvolvimento Parte 2', duracao: '45min', tipo: 'video', videoUrl: '' },
                                { id: 29, titulo: 'Testes e Debug', duracao: '35min', tipo: 'video', videoUrl: '' },
                                { id: 30, titulo: 'Otimização', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 31, titulo: 'Deploy Final', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 32, titulo: 'Apresentação do Projeto', duracao: '20min', tipo: 'video', videoUrl: '' }
                            ]
                        }
                    ]
                },
                {
                    id: 2,
                    titulo: 'Gestão de Projetos',
                    descricao: 'Aprenda metodologias ágeis e técnicas de gestão para liderar equipes e entregar projetos de sucesso.',
                    preco: 197.00,
                    duracao: '~18h',
                    totalAulas: 38,
                    totalModulos: 5,
                    imagem: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
                    modulos: [
                        {
                            id: 1,
                            titulo: 'Fundamentos Agile',
                            aulas: [
                                { id: 1, titulo: 'Manifesto Agile', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 2, titulo: 'Valores e Princípios', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 3, titulo: 'Waterfall vs Agile', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 4, titulo: 'Mindset Ágil', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 5, titulo: 'Papéis no Agile', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 6, titulo: 'Cerimônias Ágeis', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 7, titulo: 'Artefatos Ágeis', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 8, titulo: 'Prática: Simulação Agile', duracao: '45min', tipo: 'pratica', videoUrl: '' }
                            ]
                        },
                        {
                            id: 2,
                            titulo: 'Scrum Masterclass',
                            aulas: [
                                { id: 9, titulo: 'Framework Scrum', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 10, titulo: 'Product Owner', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 11, titulo: 'Scrum Master', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 12, titulo: 'Development Team', duracao: '15min', tipo: 'video', videoUrl: '' },
                                { id: 13, titulo: 'Sprint Planning', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 14, titulo: 'Daily Scrum', duracao: '15min', tipo: 'video', videoUrl: '' },
                                { id: 15, titulo: 'Sprint Review', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 16, titulo: 'Sprint Retrospective', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 17, titulo: 'Prática: Sprint Completa', duracao: '60min', tipo: 'pratica', videoUrl: '' }
                            ]
                        },
                        {
                            id: 3,
                            titulo: 'Kanban Eficiente',
                            aulas: [
                                { id: 18, titulo: 'Metodologia Kanban', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 19, titulo: 'Quadro Kanban', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 20, titulo: 'WIP Limits', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 21, titulo: 'Fluxo Contínuo', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 22, titulo: 'Métricas Kanban', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 23, titulo: 'Prática: Criando Quadro', duracao: '45min', tipo: 'pratica', videoUrl: '' }
                            ]
                        },
                        {
                            id: 4,
                            titulo: 'Planejamento de Projetos',
                            aulas: [
                                { id: 24, titulo: 'Definição de Escopo', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 25, titulo: 'Cronograma', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 26, titulo: 'Gestão de Riscos', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 27, titulo: 'Stakeholders', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 28, titulo: 'Comunicação', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 29, titulo: 'Prática: Plano de Projeto', duracao: '60min', tipo: 'pratica', videoUrl: '' }
                            ]
                        },
                        {
                            id: 5,
                            titulo: 'Projeto Final',
                            aulas: [
                                { id: 30, titulo: 'Briefing do Projeto', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 31, titulo: 'Escolha da Metodologia', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 32, titulo: 'Execução Parte 1', duracao: '45min', tipo: 'video', videoUrl: '' },
                                { id: 33, titulo: 'Execução Parte 2', duracao: '45min', tipo: 'video', videoUrl: '' },
                                { id: 34, titulo: 'Monitoramento', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 35, titulo: 'Encerramento', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 36, titulo: 'Lições Aprendidas', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 37, titulo: 'Documentação Final', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 38, titulo: 'Apresentação Final', duracao: '25min', tipo: 'video', videoUrl: '' }
                            ]
                        }
                    ]
                },
                {
                    id: 3,
                    titulo: 'Desenvolvimento Seguro',
                    descricao: 'Aprenda DevSecOps, segurança de aplicações web, banco de dados seguros e técnicas de auditoria completa.',
                    preco: 247.00,
                    duracao: '~22h',
                    totalAulas: 40,
                    totalModulos: 5,
                    imagem: 'https://images.unsplash.com/photo-1563206767-5b1d972e813e?w=400&h=300&fit=crop',
                    modulos: [
                        {
                            id: 1,
                            titulo: 'Fundamentos DevSecOps',
                            aulas: [
                                { id: 1, titulo: 'O que é DevSecOps', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 2, titulo: 'Shift Left Security', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 3, titulo: 'Cultura de Segurança', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 4, titulo: 'Automação de Segurança', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 5, titulo: 'OWASP Top 10', duracao: '35min', tipo: 'video', videoUrl: '' },
                                { id: 6, titulo: 'CWE/SANS Top 25', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 7, titulo: 'Prática: Análise de Vulnerabilidades', duracao: '45min', tipo: 'pratica', videoUrl: '' },
                                { id: 8, titulo: 'Prática: Pipeline Seguro', duracao: '50min', tipo: 'pratica', videoUrl: '' }
                            ]
                        },
                        {
                            id: 2,
                            titulo: 'Scripts de Segurança',
                            aulas: [
                                { id: 9, titulo: 'Bash para Segurança', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 10, titulo: 'Python para Security', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 11, titulo: 'Automação de Scans', duracao: '35min', tipo: 'video', videoUrl: '' },
                                { id: 12, titulo: 'Script de Hardening', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 13, titulo: 'Monitoramento Contínuo', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 14, titulo: 'Prática: Criando Scripts', duracao: '60min', tipo: 'pratica', videoUrl: '' },
                                { id: 15, titulo: 'Prática: Automação Completa', duracao: '60min', tipo: 'pratica', videoUrl: '' }
                            ]
                        },
                        {
                            id: 3,
                            titulo: 'Blindagem Web',
                            aulas: [
                                { id: 16, titulo: 'HTTPS e TLS', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 17, titulo: 'CSP - Content Security Policy', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 18, titulo: 'Prevenção XSS', duracao: '35min', tipo: 'video', videoUrl: '' },
                                { id: 19, titulo: 'Prevenção CSRF', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 20, titulo: 'Segurança de APIs', duracao: '35min', tipo: 'video', videoUrl: '' },
                                { id: 21, titulo: 'JWT e Autenticação', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 22, titulo: 'Rate Limiting', duracao: '20min', tipo: 'video', videoUrl: '' },
                                { id: 23, titulo: 'Prática: App Seguro', duracao: '60min', tipo: 'pratica', videoUrl: '' },
                                { id: 24, titulo: 'Prática: Pentest Web', duracao: '60min', tipo: 'pratica', videoUrl: '' }
                            ]
                        },
                        {
                            id: 4,
                            titulo: 'Banco de Dados Seguro',
                            aulas: [
                                { id: 25, titulo: 'SQL Injection', duracao: '35min', tipo: 'video', videoUrl: '' },
                                { id: 26, titulo: 'Prevenção SQLi', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 27, titulo: 'NoSQL Injection', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 28, titulo: 'Criptografia de Dados', duracao: '35min', tipo: 'video', videoUrl: '' },
                                { id: 29, titulo: 'Hash de Senhas', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 30, titulo: 'Backup Seguro', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 31, titulo: 'Auditoria de Banco', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 32, titulo: 'Prática: DB Hardening', duracao: '60min', tipo: 'pratica', videoUrl: '' }
                            ]
                        },
                        {
                            id: 5,
                            titulo: 'Auditoria Completa',
                            aulas: [
                                { id: 33, titulo: 'Tipos de Auditoria', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 34, titulo: 'Ferramentas de Scan', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 35, titulo: 'Relatório de Vulnerabilidades', duracao: '30min', tipo: 'video', videoUrl: '' },
                                { id: 36, titulo: 'Remediação', duracao: '25min', tipo: 'video', videoUrl: '' },
                                { id: 37, titulo: 'Compliance e LGPD', duracao: '35min', tipo: 'video', videoUrl: '' },
                                { id: 38, titulo: 'Auditoria Prática Parte 1', duracao: '60min', tipo: 'pratica', videoUrl: '' },
                                { id: 39, titulo: 'Auditoria Prática Parte 2', duracao: '60min', tipo: 'pratica', videoUrl: '' },
                                { id: 40, titulo: 'Certificação Final', duracao: '30min', tipo: 'video', videoUrl: '' }
                            ]
                        }
                    ]
                }
            ];
            Storage.set('trilhas', demoTrilhas);
            console.log('Demo trilhas seeded');
        }

        // Inicializar outras collections vazias se não existirem
        if (!Storage.get('matriculas')) Storage.set('matriculas', []);
        if (!Storage.get('progresso')) Storage.set('progresso', {});
        if (!Storage.get('certificados')) Storage.set('certificados', []);
        if (!Storage.get('anotacoes')) Storage.set('anotacoes', {});
        if (!Storage.get('duvidas')) Storage.set('duvidas', []);

        console.log('Database seeded successfully');
    },

    // CRUD Usuários
    getUsers() {
        return Storage.get('usuarios') || [];
    },

    getUserById(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    },

    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email === email);
    },

    createUser(user) {
        const users = this.getUsers();
        user.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        user.createdAt = new Date().toISOString();
        users.push(user);
        Storage.set('usuarios', users);
        return user;
    },

    // CRUD Trilhas
    getTrilhas() {
        return Storage.get('trilhas') || [];
    },

    getTrilhaById(id) {
        const trilhas = this.getTrilhas();
        return trilhas.find(t => t.id === parseInt(id));
    },

    updateTrilha(trilha) {
        const trilhas = this.getTrilhas();
        const index = trilhas.findIndex(t => t.id === trilha.id);
        if (index !== -1) {
            trilhas[index] = { ...trilhas[index], ...trilha };
            Storage.set('trilhas', trilhas);
            return trilhas[index];
        }
        return null;
    },

    // CRUD Matrículas
    getMatriculas() {
        return Storage.get('matriculas') || [];
    },

    getMatriculasByUserId(userId) {
        const matriculas = this.getMatriculas();
        return matriculas.filter(m => m.userId === userId);
    },

    createMatricula(matricula) {
        const matriculas = this.getMatriculas();
        matricula.id = matriculas.length > 0 ? Math.max(...matriculas.map(m => m.id)) + 1 : 1;
        matricula.dataMatricula = new Date().toISOString();
        matricula.status = 'ativa';
        matriculas.push(matricula);
        Storage.set('matriculas', matriculas);
        return matricula;
    },

    // CRUD Progresso
    getProgresso() {
        return Storage.get('progresso') || {};
    },

    getProgressoByUser(userId) {
        const progresso = this.getProgresso();
        return Object.keys(progresso)
            .filter(key => key.startsWith(`${userId}_`))
            .reduce((acc, key) => {
                acc[key] = progresso[key];
                return acc;
            }, {});
    },

    salvarProgresso(userId, trilhaId, moduloId, aulaId) {
        const progresso = this.getProgresso();
        const key = `${userId}_${trilhaId}`;
        
        if (!progresso[key]) {
            progresso[key] = {};
        }
        
        if (!progresso[key][moduloId]) {
            progresso[key][moduloId] = [];
        }
        
        if (!progresso[key][moduloId].includes(aulaId)) {
            progresso[key][moduloId].push(aulaId);
            Storage.set('progresso', progresso);
        }
        
        return progresso[key];
    },

    // CRUD Certificados
    getCertificados() {
        return Storage.get('certificados') || [];
    },

    getCertificadosByUserId(userId) {
        const certificados = this.getCertificados();
        return certificados.filter(c => c.userId === userId);
    },

    emitirCertificado(userId, trilhaId) {
        const certificados = this.getCertificados();
        const codigo = `CA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        
        const certificado = {
            id: certificados.length > 0 ? Math.max(...certificados.map(c => c.id)) + 1 : 1,
            userId,
            trilhaId,
            codigo,
            dataEmissao: new Date().toISOString()
        };
        
        certificados.push(certificado);
        Storage.set('certificados', certificados);
        return certificado;
    }
};

// Inicialização automática
(async () => {
    try {
        await DB.init();
        await DataManager.seed();
        console.log('Cyber Academy Database initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
})();
