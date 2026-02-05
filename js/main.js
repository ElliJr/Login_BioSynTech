        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
        import { 
            getAuth, 
            signOut,
            GoogleAuthProvider, 
            signInWithPopup,
            setPersistence,
            browserLocalPersistence,
            createUserWithEmailAndPassword,
            onAuthStateChanged,
            signInWithEmailAndPassword,
            updateProfile
        } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
        import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

        // CONFIGURAÇÃO DO FIREBASE FAVOR NÃO NÃO ALTERAR
        const firebaseConfig = {
            apiKey: "AIzaSyCfTamd-cCerKdXxsl1SrOqKKKz5gf7qek",
            authDomain: "biosyntech-fe492.firebaseapp.com",
            projectId: "biosyntech-fe492",
            storageBucket: "biosyntech-fe492.firebasestorage.app",
            messagingSenderId: "731720654700",
            appId: "1:731720654700:web:40ecd6b5304b0cd1171d49",
            measurementId: "G-ERSN909NSE"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const storage = getStorage(app);
        const provider = new GoogleAuthProvider();

        // FUNÇÕES GLOBAIS
        window.openModal = () => document.getElementById("main-modal").classList.add("show");
        window.closeModal = () => document.getElementById("main-modal").classList.remove("show");

        window.showLogin = () => {
            document.getElementById("login-box").style.display = "flex";
            document.getElementById("create-box").style.display = "none";
            document.getElementById("tab-login").classList.add("active");
            document.getElementById("tab-create").classList.remove("active");
        };

        window.showCreate = () => {
            document.getElementById("login-box").style.display = "none";
            document.getElementById("create-box").style.display = "flex";
            document.getElementById("tab-create").classList.add("active");
            document.getElementById("tab-login").classList.remove("active");
        };

        function showToast(message) {
            const toast = document.getElementById("toast");
            toast.textContent = message;
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 3000);
        }

        function loggedUi() {
            document.querySelector("#openModal").style.display = "none";
            document.querySelector(".hero__lead").style.display = "none";
            document.querySelector("#loja-main-content").classList.add("show");
            document.querySelector("#sairBtn").style.display = "block";
            document.querySelector(".campoUser").style.display = "flex";
            document.querySelector(".alert-fixed").style.display = "block";  
        }

        function logoutUi() {
            document.querySelector("#openModal").style.display = "inline-block";
            document.querySelector(".hero__lead").style.display = "block";
            document.querySelector("#loja-main-content").classList.remove("show");
            document.querySelector("#sairBtn").style.display = "none";
            document.querySelector("#nameUser").textContent = "";
            document.querySelector(".campoUser").style.display = "none";
            document.querySelector(".alert-fixed").style.display = "none";
        }

        // MONITORAR AUTENTICAÇÃO
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Usuário restaurado:", user.email);
                document.querySelector("#nameUser").innerText = user.email;
                loggedUi();
            } else {
                console.log("Nenhum usuário logado.");
                logoutUi();
            }
        });

        // CRIAR CONTA
        document.getElementById("btn-create").addEventListener("click", async () => {
            const apelido = document.getElementById("create-apelido").value;
            const email = document.getElementById("create-email").value;
            const password = document.getElementById("create-password").value;
            const confirmPassword = document.getElementById("create-password-confirm").value;
            const errorDiv = document.getElementById("create-error");

            errorDiv.style.display = "none";

            if (!apelido || !email || !password || !confirmPassword) {
                errorDiv.textContent = "Preencha todos os campos";
                errorDiv.style.display = "block";
                return;
            }

            if (password !== confirmPassword) {
                errorDiv.textContent = "As senhas não coincidem";
                errorDiv.style.display = "block";
                return;
            }

            try {
                await setPersistence(auth, browserLocalPersistence);
                const result = await createUserWithEmailAndPassword(auth, email, password);
                
                // Atualizar perfil com o apelido
                await updateProfile(result.user, {
                    displayName: apelido
                });

                showToast("Conta criada com sucesso!");
                document.getElementById("create-apelido").value = "";
                document.getElementById("create-email").value = "";
                document.getElementById("create-password").value = "";
                document.getElementById("create-password-confirm").value = "";
                window.closeModal();
                window.showLogin();
            } catch (error) {
                let message = error.message;
                if (error.code === 'auth/email-already-in-use') {
                    message = "Email já cadastrado";
                } else if (error.code === 'auth/weak-password') {
                    message = "Senha muito fraca (mínimo 6 caracteres)";
                }
                errorDiv.textContent = message;
                errorDiv.style.display = "block";
            }
        });

        // LOGIN COM EMAIL
        document.getElementById("btn-login").addEventListener("click", async () => {
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            const errorDiv = document.getElementById("login-error");

            errorDiv.style.display = "none";

            if (!email || !password) {
                errorDiv.textContent = "Preencha todos os campos";
                errorDiv.style.display = "block";
                return;
            }

            try {
                await setPersistence(auth, browserLocalPersistence);
                await signInWithEmailAndPassword(auth, email, password);
                showToast("Login realizado com sucesso!");
                window.closeModal();
            } catch (error) {
                let message = error.message;
                if (error.code === 'auth/user-not-found') {
                    message = "Usuário não encontrado";
                } else if (error.code === 'auth/wrong-password') {
                    message = "Senha incorreta";
                }
                errorDiv.textContent = message;
                errorDiv.style.display = "block";
            }
        });

        // LOGIN COM GOOGLE
        document.getElementById("google-login").addEventListener("click", async () => {
            try {
                await setPersistence(auth, browserLocalPersistence);
                const result = await signInWithPopup(auth, provider);
                showToast("Login com Google realizado!");
                window.closeModal();
            } catch (error) {
                document.getElementById("login-error").textContent = error.message;
                document.getElementById("login-error").style.display = "block";
            }
        });

        // LOGOUT
        document.getElementById("sairBtn").addEventListener("click", async () => {
            try {
                await signOut(auth);
                showToast("Logout realizado com sucesso!");
                document.getElementById("login-email").value = "";
                document.getElementById("login-password").value = "";
            } catch (error) {
                console.error("Erro ao fazer logout:", error);
            }
        });

        // UPLOAD DE FOTO
        const iconInput = document.getElementById('iconFileInput');
        const preview = document.getElementById('preview');

        iconInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file || !auth.currentUser) return;

            preview.src = URL.createObjectURL(file);

            try {
                const storageRef = ref(storage, `users/${auth.currentUser.uid}/profile.jpg`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                
                await updateProfile(auth.currentUser, {
                    photoURL: url
                });

                preview.src = url;
                showToast("Foto atualizada com sucesso!");
            } catch (error) {
                console.error("Erro no upload:", error);
                showToast("Erro ao atualizar foto");
            }
        });