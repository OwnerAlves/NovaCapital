document.addEventListener('DOMContentLoaded', () => {
    // --- Audio Interaction Code START ---
    const audioContext = new(window.AudioContext || window.webkitAudioContext)();
    let clickSoundBuffer = null;
    let hoverSoundBuffer = null;

    async function loadSound(url) {
        if (!audioContext) return null;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${url}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch (error) {
            console.error(`Error loading sound: ${url}`, error);
            return null;
        }
    }

    async function initSounds() {
        clickSoundBuffer = await loadSound('/ui_click.mp3');
        hoverSoundBuffer = await loadSound('/ui_hover.mp3');
    }

    function playSound(buffer) {
        if (!buffer || !audioContext) return;
        if (audioContext.state === 'suspended') {
            audioContext.resume().catch(err => console.error("Error resuming audio context:", err));
        }
        if (audioContext.state === 'running') {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
        } else {
            console.warn("AudioContext not running, cannot play sound.");
        }
    }

    initSounds().then(() => {
        if (!clickSoundBuffer && !hoverSoundBuffer) {
            console.warn("Sounds could not be loaded. Interactive sounds will be disabled.");
        }
        const interactiveElements = document.querySelectorAll(
            'button, a.cta-button, .nav-links a, .nav-logo a, .rules-category-header, .tab-button, a.form-link, footer .social-links a'
        );

        interactiveElements.forEach(element => {
            element.addEventListener('click', () => {
                if (audioContext && audioContext.state === 'suspended') {
                    audioContext.resume().then(() => {
                        if (clickSoundBuffer) playSound(clickSoundBuffer);
                    }).catch(err => console.error("Error resuming audio context on click:", err));
                } else if (clickSoundBuffer) {
                    playSound(clickSoundBuffer);
                }
            });

            element.addEventListener('mouseenter', () => {
                if (hoverSoundBuffer && audioContext && audioContext.state === 'running') {
                    playSound(hoverSoundBuffer);
                }
            });
        });
    }).catch(error => {
        console.error("Error initializing sounds:", error);
    });
    // --- Audio Interaction Code END ---

    // --- Mobile menu toggle (Dropdown behavior) ---
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuButton && navLinks) {
        const icon = mobileMenuButton.querySelector('i');

        mobileMenuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            navLinks.classList.toggle('active');

            if (navLinks.classList.contains('active')) {
                if (icon) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            } else {
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        });

        document.addEventListener('click', (event) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(event.target) &&
                !mobileMenuButton.contains(event.target)) {

                navLinks.classList.remove('active');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Add resize listener to reset mobile menu state if window becomes desktop-sized
        window.addEventListener('resize', () => {
            // 769px is the breakpoint used in style.css for desktop view
            if (window.innerWidth >= 769) {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active'); // Close mobile menu
                    if (icon) {
                        icon.classList.remove('fa-times'); // Reset icon
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });

    }
    // --- End of Mobile menu toggle ---


    // Active navigation link styling
    const currentLocation = window.location.pathname.split('/').pop() || 'index.html';
    const allNavLinks = document.querySelectorAll('.nav-links a');
    allNavLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentLocation) {
            link.classList.add('active');
        }
        if (currentLocation === '' && linkPage === 'index.html') {
            link.classList.add('active');
        }
    });

    // Rules page: Expandable categories
    const ruleCategoryHeaders = document.querySelectorAll('.rules-category-header');
    ruleCategoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.toggle-icon');

            if (content.style.display === 'block') {
                content.style.display = 'none';
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
                content.style.display = 'block';
                if (icon) icon.style.transform = 'rotate(90deg)';
            }
        });
    });

    // Basic form submission handler (prevents default and logs for now)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log('Form submitted:', form.id);
            if (form.id === 'supportForm') {
                handleSupportFormSubmit(form); // Updated to call new handler
            }
            if (form.id === 'adminLoginForm') {
                handleAdminLogin(form);
            }
        });
    });

    // --- Support Ticket System START ---
    function handleSupportFormSubmit(form) {
        const formData = new FormData(form);
        const ticketData = {
            id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: formData.get('name'),
            serverId: formData.get('serverId') || 'N/A',
            email: formData.get('email'),
            subject: formData.get('subject'),
            problem: formData.get('problem'),
            attachmentName: formData.get('attachment') ? .name || 'Nenhum',
            timestamp: new Date().toLocaleString('pt-BR'),
            status: 'Novo' // Default status
        };

        try {
            let tickets = JSON.parse(localStorage.getItem('supportTickets')) || [];
            tickets.unshift(ticketData); // Add new ticket to the beginning
            localStorage.setItem('supportTickets', JSON.stringify(tickets));

            const confirmationMessage = document.getElementById('supportConfirmation');
            if (confirmationMessage) {
                confirmationMessage.style.display = 'block';
                confirmationMessage.innerHTML = 'Seu ticket foi enviado com sucesso! Iremos analisar e enviar uma resposta para o seu e-mail. <br>Para assuntos de extrema importância, por favor, entre em nosso <a href="https://discord.gg/7nTDZ6VdrU" target="_blank" style="color: white; text-decoration: underline;">Discord</a>.';
                form.reset();
                setTimeout(() => {
                    confirmationMessage.style.display = 'none';
                }, 8000); // Increased timeout for longer message
            } else {
                alert('Seu ticket foi enviado com sucesso! Iremos analisar e enviar uma resposta para o seu e-mail. Para assuntos de extrema importância, por favor, entre em nosso Discord.');
            }
        } catch (error) {
            console.error("Erro ao salvar ticket no localStorage:", error);
            alert('Ocorreu um erro ao enviar seu ticket. Tente novamente.');
        }
    }

    const ADMIN_PASSWORD = "ncrp2025"; // Store securely in a real app!

    function authenticateAdmin() {
        const enteredPassword = prompt("Por favor, insira a senha de administrador:", "");
        if (enteredPassword === ADMIN_PASSWORD) {
            return true;
        } else if (enteredPassword !== null && enteredPassword !== "") { // User entered something wrong
            const accessDeniedMsg = document.getElementById('admin-access-denied');
            const authSection = document.getElementById('admin-auth-section');
            const contentSection = document.getElementById('admin-content-section');

            // This old logic for prompt-based auth needs to be mostly removed or adapted.
            // For now, we'll just return false. The new handleAdminLogin will manage UI.
            if (document.getElementById('admin-page')) { // Only if on admin page
                if (accessDeniedMsg) accessDeniedMsg.style.display = 'block';
                if (authSection) authSection.style.display = 'block'; // Ensure login form is visible
                if (contentSection) contentSection.style.display = 'none';
            }
        } else { // User cancelled or entered nothing
            if (document.getElementById('admin-page')) {
                const authSection = document.getElementById('admin-auth-section');
                // If user cancels prompt, make sure login form is still visible
                if (authSection) authSection.style.display = 'block';
            }
        }
        return false;
    }

    function handleAdminLogin(form) {
        const passwordInput = form.querySelector('#adminPassword');
        const enteredPassword = passwordInput.value;

        const authSection = document.getElementById('admin-auth-section');
        const contentSection = document.getElementById('admin-content-section');
        const accessDeniedMsg = document.getElementById('admin-access-denied');

        if (enteredPassword === ADMIN_PASSWORD) {
            if (authSection) authSection.style.display = 'none';
            if (contentSection) contentSection.style.display = 'block';
            if (accessDeniedMsg) accessDeniedMsg.style.display = 'none';
            displayTickets();

            const refreshButton = document.getElementById('refreshTicketsBtn');
            if (refreshButton) {
                refreshButton.addEventListener('click', displayTickets);
            }
        } else {
            if (authSection) authSection.style.display = 'block'; // Keep login form visible
            if (contentSection) contentSection.style.display = 'none';
            if (accessDeniedMsg) accessDeniedMsg.style.display = 'block';
            passwordInput.value = ''; // Clear password field
            passwordInput.focus();
        }
    }


    function displayTickets() {
        const ticketListContainer = document.getElementById('admin-ticket-list');
        if (!ticketListContainer) return;

        ticketListContainer.innerHTML = ''; // Clear previous list

        try {
            const tickets = JSON.parse(localStorage.getItem('supportTickets')) || [];
            if (tickets.length === 0) {
                ticketListContainer.innerHTML = '<p>Nenhum ticket de suporte encontrado.</p>';
                return;
            }

            const ul = document.createElement('ul');
            ul.className = 'admin-tickets-ul';
            tickets.forEach((ticket, index) => {
                const li = document.createElement('li');
                li.className = 'admin-ticket-item';

                // Prepare attachment download button if an attachment exists
                let attachmentDownloadButtonHTML = '';
                if (ticket.attachmentName && ticket.attachmentName !== 'Nenhum') {
                    attachmentDownloadButtonHTML = `
                        <button class="download-attachment-btn" data-attachment-name="${escapeHTML(ticket.attachmentName)}">
                            <i class="fas fa-download"></i> Baixar Anexo
                        </button>
                    `;
                }

                li.innerHTML = `
                    <div class="ticket-header">
                        <h4>Assunto: ${escapeHTML(ticket.subject)} <span class="ticket-status status-${ticket.status.toLowerCase().replace(/\s+/g, '-')}">${escapeHTML(ticket.status)}</span></h4>
                        <small>ID: ${escapeHTML(ticket.id)} | Enviado em: ${escapeHTML(ticket.timestamp)}</small>
                    </div>
                    <div class="ticket-details">
                        <p><strong>Nome:</strong> ${escapeHTML(ticket.name)}</p>
                        <p><strong>Email:</strong> ${escapeHTML(ticket.email)}</p>
                        <p><strong>ID Servidor:</strong> ${escapeHTML(ticket.serverId)}</p>
                        <p><strong>Problema:</strong></p>
                        <pre>${escapeHTML(ticket.problem)}</pre>
                        <p><strong>Anexo:</strong> ${escapeHTML(ticket.attachmentName)} ${attachmentDownloadButtonHTML}</p>
                    </div>
                    <div class="ticket-actions">
                        <button class="delete-ticket-btn" data-ticket-id="${ticket.id}"><i class="fas fa-trash-alt"></i> Excluir</button>
                        <select class="update-status-select" data-ticket-id="${ticket.id}">
                            <option value="Novo" ${ticket.status === 'Novo' ? 'selected' : ''}>Novo</option>
                            <option value="Em Análise" ${ticket.status === 'Em Análise' ? 'selected' : ''}>Em Análise</option>
                            <option value="Resolvido" ${ticket.status === 'Resolvido' ? 'selected' : ''}>Resolvido</option>
                            <option value="Fechado" ${ticket.status === 'Fechado' ? 'selected' : ''}>Fechado</option>
                        </select>
                    </div>
                `;
                ul.appendChild(li);
            });
            ticketListContainer.appendChild(ul);

            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-ticket-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const ticketIdToDelete = this.getAttribute('data-ticket-id');
                    if (confirm(`Tem certeza que deseja excluir o ticket ID: ${ticketIdToDelete}?`)) {
                        deleteTicket(ticketIdToDelete);
                    }
                });
            });
            // Add event listeners for status updates
            document.querySelectorAll('.update-status-select').forEach(select => {
                select.addEventListener('change', function() {
                    const ticketIdToUpdate = this.getAttribute('data-ticket-id');
                    const newStatus = this.value;
                    updateTicketStatus(ticketIdToUpdate, newStatus);
                });
            });

            // Add event listeners for download attachment buttons
            document.querySelectorAll('.download-attachment-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const attachmentName = this.getAttribute('data-attachment-name');
                    alert(`Simulação de download para: ${attachmentName}\n\n(A funcionalidade de download real de arquivos não está implementada nesta demonstração, pois os arquivos não são armazenados no LocalStorage.)`);
                    // In a real application, this would trigger an actual file download.
                    // Since the file data isn't stored, we can only simulate this.
                });
            });

        } catch (error) {
            console.error("Erro ao carregar tickets do localStorage:", error);
            ticketListContainer.innerHTML = '<p>Erro ao carregar tickets. Verifique o console para detalhes.</p>';
        }
    }

    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, function(match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    }


    function deleteTicket(ticketId) {
        try {
            let tickets = JSON.parse(localStorage.getItem('supportTickets')) || [];
            tickets = tickets.filter(ticket => ticket.id !== ticketId);
            localStorage.setItem('supportTickets', JSON.stringify(tickets));
            displayTickets(); // Refresh the list
        } catch (error) {
            console.error("Erro ao excluir ticket:", error);
            alert("Erro ao excluir ticket.");
        }
    }

    function updateTicketStatus(ticketId, newStatus) {
        try {
            let tickets = JSON.parse(localStorage.getItem('supportTickets')) || [];
            const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId);
            if (ticketIndex > -1) {
                tickets[ticketIndex].status = newStatus;
                localStorage.setItem('supportTickets', JSON.stringify(tickets));
                displayTickets(); // Refresh the list
            }
        } catch (error) {
            console.error("Erro ao atualizar status do ticket:", error);
            alert("Erro ao atualizar status do ticket.");
        }
    }


    // Load admin tickets if on admin page
    if (document.getElementById('admin-page')) {
        // The new logic is: Admin page loads, shows login form.
        // Authentication happens via handleAdminLogin on form submit.
        // No automatic authentication attempt on page load anymore.
        // The old prompt-based authenticateAdmin() is no longer directly called on page load here.
        // Initial state: login form visible, content section hidden.
        const authSection = document.getElementById('admin-auth-section');
        const contentSection = document.getElementById('admin-content-section');
        const accessDeniedMsg = document.getElementById('admin-access-denied');

        if (authSection) authSection.style.display = 'block';
        if (contentSection) contentSection.style.display = 'none';
        if (accessDeniedMsg) accessDeniedMsg.style.display = 'none';

        // If a refresh button exists (it's inside the content section),
        // it means the user might have already logged in, and this script part is re-evaluated (e.g., after a soft navigation or error).
        // We could add a session-like check here if needed, but for now, re-login is fine.
    }
    // --- Support Ticket System END ---

    // --- "Play Now" Button Functionality START ---
    const playNowButton = document.getElementById('playNowButton');
    if (playNowButton) {
        const serverIp = "seu.ip.do.servidor:porta"; // !!! REPLACE WITH ACTUAL SERVER IP AND PORT !!!

        playNowButton.addEventListener('click', (event) => {
            event.preventDefault();

            // 1. Copy IP to clipboard
            navigator.clipboard.writeText(serverIp).then(() => {
                // 2. Attempt to open SA-MP client
                // Note: The user must have SA-MP installed and the samp:// protocol handler registered.
                window.location.href = `samp://${serverIp}`;

                // 3. Provide feedback
                // Create a temporary notification element
                const notification = document.createElement('div');
                notification.textContent = `IP: ${serverIp} copiado! Iniciando SA-MP...`;
                notification.style.position = 'fixed';
                notification.style.bottom = '20px';
                notification.style.left = '50%';
                notification.style.transform = 'translateX(-50%)';
                notification.style.padding = '10px 20px';
                notification.style.backgroundColor = 'var(--accent-color)';
                notification.style.color = 'var(--text-color)';
                notification.style.borderRadius = 'var(--border-radius)';
                notification.style.boxShadow = 'var(--box-shadow)';
                notification.style.zIndex = '2000';
                notification.style.transition = 'opacity 0.5s ease-in-out';
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 500);
                }, 3500); // Notification visible for 3.5 seconds

            }).catch(err => {
                console.error('Erro ao copiar o IP ou abrir SA-MP:', err);
                alert('Erro ao copiar o IP. Por favor, copie manualmente: ' + serverIp);
            });
        });
    }
    // --- "Play Now" Button Functionality END ---

});