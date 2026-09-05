/**
 * CYBER ACADEMY - AUTH.JS
 * Sistema de autenticação e gerenciamento de sessão
 */

const Auth = {
    SESSION_KEY: 'ca_current_user',

    /**
     * Realiza login do usuário
     */
    async login(email, senha) {
        try {
            const user = DataManager.getUserByEmail(email);
            
            if (!user) {
                throw new Error('E-mail não encontrado');
            }

            if (user.senha !== senha) {
                throw new Error('Senha incorreta');
            }

            // Salva sessão
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
            
            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Realiza cadastro de novo usuário
     */
    async register(nome, email, senha, perfil = 'aluno') {
        try {
            // Validações
            if (!nome || !email || !senha) {
                throw new Error('Preencha todos os campos');
            }

            if (senha.length < 6) {
                throw new Error('A senha deve ter no mínimo 6 caracteres');
            }

            if (!email.includes('@')) {
                throw new Error('E-mail inválido');
            }

            // Verifica se e-mail já existe
            const existingUser = DataManager.getUserByEmail(email);
            if (existingUser) {
                throw new Error('Este e-mail já está cadastrado');
            }

            // Cria usuário
            const user = DataManager.createUser({
                nome,
                email,
                senha,
                perfil
            });

            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Logout do usuário
     */
    logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
        window.location.href = '../login.html';
    },

    /**
     * Retorna usuário logado
     */
    getCurrentUser() {
        const data = sessionStorage.getItem(this.SESSION_KEY);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Verifica se há usuário logado
     */
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    /**
     * Redireciona para login se não estiver autenticado
     */
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '../login.html';
            return false;
        }
        return true;
    },

    /**
     * Redireciona para dashboard se não for aluno
     */
    requireAluno() {
        if (!this.requireAuth()) return false;
        
        const user = this.getCurrentUser();
        if (user.perfil !== 'aluno') {
            window.location.href = '../professor/dashboard.html';
            return false;
        }
        return true;
    },

    /**
     * Redireciona para dashboard se não for professor
     */
    requireProfessor() {
        if (!this.requireAuth()) return false;
        
        const user = this.getCurrentUser();
        if (user.perfil !== 'professor') {
            window.location.href = '../aluno/dashboard.html';
            return false;
        }
        return true;
    },

    /**
     * Gera HTML da sidebar dinamicamente
     */
    buildSidebar(user, currentPage = '', isProfessor = false) {
        const initials = user.nome.split(' ').map(n => n[0]).join('').toUpperCase().substr(0, 2);
        
        const alunoMenu = `
            <a href="dashboard.html" class="nav-item ${currentPage === 'dashboard' ? 'active' : ''}">
                <i>📊</i> Dashboard
            </a>
            <a href="minhas-trilhas.html" class="nav-item ${currentPage === 'minhas-trilhas' ? 'active' : ''}">
                <i>📚</i> Minhas Trilhas
            </a>
            <a href="certificados.html" class="nav-item ${currentPage === 'certificados' ? 'active' : ''}">
                <i>🏆</i> Certificados
            </a>
            <a href="perfil.html" class="nav-item ${currentPage === 'perfil' ? 'active' : ''}">
                <i>👤</i> Meu Perfil
            </a>
        `;

        const professorMenu = `
            <a href="dashboard.html" class="nav-item ${currentPage === 'dashboard' ? 'active' : ''}">
                <i>📊</i> Dashboard
            </a>
            <a href="gerenciar-trilha.html" class="nav-item ${currentPage === 'gerenciar-trilha' ? 'active' : ''}">
                <i>📝</i> Gerenciar Trilha
            </a>
            <a href="alunos.html" class="nav-item ${currentPage === 'alunos' ? 'active' : ''}">
                <i>👥</i> Meus Alunos
            </a>
        `;

        return `
            <div class="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logo">🎓 Cyber Academy</div>
                </div>
                
                <div class="user-info">
                    <div class="user-avatar">${initials}</div>
                    <div class="user-details">
                        <h4>${user.nome}</h4>
                        <p>${user.perfil === 'aluno' ? 'Aluno' : 'Professor'}</p>
                    </div>
                </div>

                <nav class="nav-menu">
                    ${isProfessor ? professorMenu : alunoMenu}
                    <a href="#" onclick="Auth.logout()" class="nav-item">
                        <i>🚪</i> Sair
                    </a>
                </nav>
            </div>
        `;
    }
};
