class LoginScene extends  Phaser.Scene {
    constructor() {
        super({key: 'loginscene'});

    }

    preload() {
    }

    create() {
        this.client = new LoginClient(this, cip, csocket);
        this.client.sender.connect();
        this.loginForm = this.add.dom(400, 400).createFromCache('loginform');
        this.usernameField = this.loginForm.getChildByName('username');
        this.passwordField = this.loginForm.getChildByName('password');
        let loginBtn = this.loginForm.getChildByName('login');
        let newBtn = this.loginForm.getChildByName('new');

        loginBtn.addEventListener("click", (event)=>{
            event.preventDefault();
            this.loginHandler();
        });
        newBtn.addEventListener("click", (event)=>{
            event.preventDefault();
            this.createHandler();
        });
    }

    loginHandler(){
        this.client.sender.login(this.usernameField.value,this.passwordField.value);
    }

    createHandler(){
        this.client.sender.createAccount(this.usernameField.value,this.passwordField.value);
    }


    loggedIn(data){
        console.log("logged in" + data);
        let mainGameScene = this.scene.start('maingame',{ socket: this.client.socket });
    }
}