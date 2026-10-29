/* hash-password.js — genera el hash bcrypt para ADMIN_PASSWORD_HASH.
 *
 * Uso (desde la carpeta backend/):   npm run hash-password
 * Pide la contraseña sin mostrarla en pantalla y sin dejarla en el historial
 * del terminal (a diferencia de `node -e "...hashSync('mi-clave')"`), y
 * escribe SOLO el hash. Pégalo en la variable ADMIN_PASSWORD_HASH de Render
 * (o de tu .env local); la contraseña no se guarda en ningún sitio.
 */
const bcrypt = require("bcryptjs");

const MIN_LENGTH = 12;

function readHidden(prompt) {
	return new Promise((resolve) => {
		const { stdin, stdout } = process;
		if (!stdin.isTTY) { // entrada redirigida (pruebas): se lee tal cual
			let data = "";
			stdin.on("data", (d) => { data += d; });
			stdin.on("end", () => resolve(data.replace(/\r?\n$/, "")));
			return;
		}
		stdout.write(prompt);
		let value = "";
		stdin.setRawMode(true);
		stdin.resume();
		stdin.setEncoding("utf8");
		const onData = (ch) => {
			for (const c of ch) {
				if (c === "\r" || c === "\n" || c === "\u0004") {
					stdin.setRawMode(false);
					stdin.pause();
					stdin.removeListener("data", onData);
					stdout.write("\n");
					return resolve(value);
				}
				if (c === "\u0003") process.exit(130); // Ctrl+C
				if (c === "\u007f" || c === "\b") value = value.slice(0, -1);
				else value += c;
			}
		};
		stdin.on("data", onData);
	});
}

(async () => {
	const password = await readHidden("Nueva contraseña del administrador: ");
	if (password.length < MIN_LENGTH) {
		console.error(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres.`);
		process.exit(1);
	}
	if (process.stdin.isTTY) {
		const again = await readHidden("Repítela: ");
		if (again !== password) {
			console.error("Las contraseñas no coinciden.");
			process.exit(1);
		}
	}
	console.log(bcrypt.hashSync(password, 12));
})();
