# Wordle-szerű szókitaláló játék – CI/CD + DevOps beadandó

Ez a projekt egy egyszerű, 5 betűs szóra épülő **Wordle-szerű játék** Node.js + Express alapon, amelyre teljes CI/CD folyamatot és monitoringot építettem.

A játék:
- a böngészőben fut,
- a szerver egy **random magyar szót** választ egy előre definiált szólistából,
- a játékos tippjeire betűnként visszajelzést ad:
  - 🟩 zöld – jó betű, jó helyen (`correct`)
  - 🟨 sárga – jó betű, de rossz helyen (`present`)
  - ⬛ szürke – nincs ilyen betű a szóban (`absent`)

A projekt célja:  
**egy egyszerű, de végigtesztelt alkalmazásra teljes CI/CD láncot és monitoring infrastruktúrát kiépíteni.**

---

## 0. Gyors indítás - parancsok

### 1) Projekt klónozása

``` git clone https://github.com/Klbrtmr/Wordle_Devops.git ```

``` cd Worlde_Devops ```

### 2) Lokális futtatás Node.js-sel
``` npm install ```

``` npm run lint ```

``` npm test ```

``` npm start ```

Böngészőben Böngészőben: http://localhost:3000

### 3) Futtatás Dockerrel

``` docker build -t klbrtmr/word-guess-game:latest . ```

``` cd deploy ```

``` docker-compose up -d ```

Böngészőben Böngészőben: http://localhost:3000

### 4) Deploy Ansible-lel

``` cd ansible ```

``` ansible-playbook -i inventory.ini deploy.yml ```

### 5) Monitoring stact indítása (Terraform)

``` cd terraform```

``` terraform init ```

``` terraform apply   # kérdésre: yes ```

Elérési pontok

- cAdvisor: http://localhost:8081

- Prometheus: http://localhost:9090

- Grafana: http://localhost:3100

### 6) Jenkins CI/CD pipeline indítása

```
docker run -d \
  --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
 ```

Szükséges tool-ok telepítése a Jenkins konténerbe

```docker exec -u root -it jenkins bash ```

``` apt-get update```

``` apt-get install -y nodejs npm docker-compose ansible ```

``` exit ```

Jenkins indítása

 ``` docker start jenkins ```

 A böngészőben: http://localhost:8080

---

## 1. Fő technológiák

### Alkalmazás

- **Node.js 20 + Express**
- EJS template-ek
- Egyszerű in-memory állapotkezelés (próbálkozások, nyert/vesztett állapot)
- Játéklogika: `wordgame.js`
- HTTP loggolás: `morgan` middleware (kérések naplózása stdout-ra / Docker logba)

### Tesztelés

- **Mocha + Chai** – unit és HTTP endpoint tesztek
- **ESLint** – kódszabályok ellenőrzése (.eslintrc.cjs)

### Konténerizáció

- Docker
- `Dockerfile`
- `deploy/docker-compose.yml` – a játék konténer futtatására

### CI/CD

- **Jenkins** – pipeline alapú CI/CD
- **Ansible** – deploy a szerverre / Jenkins környezetre
- GitHub repository – verziókövetés

### IaC + Monitorozás

- **Terraform** – monitoring stack létrehozása
- **Prometheus** – metrikák gyűjtése
- **cAdvisor** – konténer szintű metrikák (CPU, memória, stb.)
- **Grafana** – dashboardok és vizualizáció

---

## 2. Könyvtárstruktúra

```text
Wordle_Devops/
  app.js                 # Express app, route-ok, játékállapot
  wordgame.js            # játéklogika (evaluateGuess, stb.)
  package.json
  Dockerfile
  Jenkinsfile            # Jenkins pipeline definíció

  public/
    styles.css           # egyszerű UI

  views/
    index.ejs            # fő játékoldal (rács, színezés, form)

  test/
    wordgame.test.js     # Mocha + Chai tesztek (logika + HTTP)

  deploy/
    docker-compose.yml   # app konténer futtatása

  ansible/
    inventory.ini        # [app] localhost
    deploy.yml           # docker-compose up -d Ansible-ből

  terraform/
    main.tf              # Docker network + cAdvisor + Prometheus + Grafana
    prometheus.yml       # Prometheus scrape config (cAdvisor)
