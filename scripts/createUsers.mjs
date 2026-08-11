import { createClient } from "@supabase/supabase-js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "ERRO: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram encontradas."
  );

  console.error(
    "Execute com: node --env-file=.env scripts/createUsers.mjs"
  );

  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Todos serão criados inicialmente como Funcionário
// e com a senha padrão 123456.

const users = [

    {
    name: "ADLEI DE ALMEIDA",
    username: "adlei.almeida",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ADRIANA BARBOSA DOS SANTOS",
    username: "adriana.santos",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ADRIANA FRANCEZ MARTINS DA CONCEICAO",
    username: "adriana.conceicao",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ALEX SANDRO FERREIRA DA SILVA",
    username: "alex.silva",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ANA GONCALVES DE FRANCA ARANDA",
    username: "ana.aranda",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ANA CLAUDIA GERVÁSIO",
    username: "ana.gervasio",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ANA PAULA RAMOS JOHAS",
    username: "ana.johas",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ANDRE ASSUNÇÃO SILVA",
    username: "andre.silva",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ANDREIA TAVARES DA SILVA",
    username: "andreia.silva",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ANTONIO BUCATER JUNIOR",
    username: "antonio.junior",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ATILIO LUIS LUDOVICO ROSSI",
    username: "atilio.rossi",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "BRUNA BARBOSA CASITA",
    username: "bruna.casita",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "BRUNA DE MELO NATALI",
    username: "bruna.natali",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "CARLOS HERMENEGILDO LANG",
    username: "carlos.lang",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "CASSIA ABRANTES BATISTA",
    username: "cassia.batista",
    password: "123456",
    role: "Funcionário",
  },

    {
    name: "CICERA BRAZ DE SOUSA",
    username: "cicera.sousa",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "CICERO CARLOS DA SILVA",
    username: "cicero.silva",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "CLAUDIO MARCIO DE QUEIROZ ALVES",
    username: "claudio.alves",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "CLAUDIONOR AGOPIAN DE LUCENA",
    username: "claudionor.lucena",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "CLAUDIO ROBERTO DA SILVA",
    username: "claudio.silva",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "DAIANE CRISTINA DE QUEIROZ SOUSA",
    username: "daiane.sousa",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "DANIELE DIAS INNOCENCIO",
    username: "daniele.innocencio",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "DANIELE SILVA ROMERO",
    username: "daniele.romero",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "DENIS BRAGA DE MENEZES",
    username: "denis.menezes",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "DIEGO OLIVEIRA BARROS",
    username: "diego.barros",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "DIOGO FERREIRA DO NASCIMENTO",
    username: "diogo.nascimento",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "EDUARDO MELO DA COSTA",
    username: "eduardo.costa",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ELAINE CRISTINA GERVASIO MAXIMO",
    username: "elaine.maximo",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ELIELTON SILVA SANTOS GONCALVES",
    username: "elielton.goncalves",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ELISETE SOARES ROMERA",
    username: "elisete.romera",
    password: "123456",
    role: "Funcionário",
  },

    {
    name: "ERICK OLIVEIRA BARROS",
    username: "erick.barros",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "FABIANA DE CASTRO BALDESIN",
    username: "fabiana.baldesin",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "FERNANDA QUEIROZ ALVES",
    username: "fernanda.alves",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "GABRIELLA CHAGAS KAKO",
    username: "gabriella.kako",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "GISELLE VICTORIA LAURIANO SANTOS",
    username: "giselle.santos",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "JANE ATANASOV",
    username: "jane.atanasov",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "JESSICA BITTENCOURT TRINDADE LETTIERI",
    username: "jessica.lettieri",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "JESSICA LAYLE NOVAES COSTA",
    username: "jessica.costa",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "JESSICA MELQUIADES CONDE",
    username: "jessica.conde",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "JOSUÉ DE PAULA DE JESUS",
    username: "josue.jesus",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "JULIANA DIAS ADÃO",
    username: "juliana.adao",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "JULIO DA COSTA NEVES NETO",
    username: "julio.neto",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "KARIN KEIKO OKI IZUMI",
    username: "karin.izumi",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "KAROLINE SPINA SANCHES",
    username: "karoline.sanches",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "LAIRTON QUEIROZ ALVES",
    username: "lairton.alves",
    password: "123456",
    role: "Funcionário",
  },


    {
    name: "LARISSA DE CARVALHO SILVA",
    username: "larissa.silva",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "LEONARDO CHIUFFA FARIAS",
    username: "leonardo.farias",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "LUDMILLA SOARES DE OLIVEIRA",
    username: "ludmilla.oliveira",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "LUIZ FERNANDO SORIA CAVALLINI",
    username: "luiz.cavallini",
    password: "123456",
    role: "Funcionário",
  },
 
  {
    name: "MAICON DE OLIVERA CORDEIRO",
    username: "maicon.cordeiro",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MARCICLEIDE DA SILVA MARTINS",
    username: "marcicleide.martins",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MARCIO DE OLIVEIRA PENNA SAMBI",
    username: "marcio.sambi",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MARCIO RICARDO RAVAGNANI",
    username: "marcio.ravagnani",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MARCOS FRANCEZ",
    username: "marcos.francez",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MARCUS VINICIUS DELFINE FELIBERTO DE CARVALHO",
    username: "marcus.carvalho",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MARINEY PRIMO MENEZES LAGOS",
    username: "mariney.lagos",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MARSELHA FERRARA",
    username: "marselha.ferrara",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MARY IZILDA ARELLO",
    username: "mary.arello",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MAURICEIA SILVA DE CARVALHO",
    username: "mauriceia.carvalho",
    password: "123456",
    role: "Funcionário",
  },

    {
    name: "MAURICIO GONCALVES DE ALVIM",
    username: "mauricio.alvim",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MAURICIO SILVA DE CARVALHO",
    username: "mauricio.carvalho",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MAURO HONDA",
    username: "mauro.honda",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MICHELE CHAVES DE SOUZA",
    username: "michele.souza",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MICNEIAS RAMOS DE ALMEIDA",
    username: "micneias.almeida",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "MIRIAN DE CARVALHO SANTOS",
    username: "mirian.santos",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "NICOLE MIRANDA FERREIRA",
    username: "nicole.ferreira",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "NILSON PINTO SIQUEIRA",
    username: "nilson.siqueira",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "PEDRO HENRIQUE PERES",
    username: "pedro.peres",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "RAFAEL ANTUNES DE SOUZA",
    username: "rafael.souza",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "RICARDO LUIZ ROSSI",
    username: "ricardo.rossi",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "RICKELME DA SILVA LOPES",
    username: "rickelme.lopes",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "RODRIGO DI SESSA FASSINA",
    username: "rodrigo.fassina",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "ROGERIO NOGUEIRA ADAO",
    username: "rogerio.adao",
    password: "123456",
    role: "Funcionário",
  },
 

    {
    name: "RUAN PABLO QUEIROZ DE BORBA",
    username: "ruan.borba",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "SAMELA MARIA DE SANTANA",
    username: "samela.santana",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "SARA FRANCEZ",
    username: "sara.francez",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "SERGIO DIAS DOS SANTOS",
    username: "sergio.santos",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "SILVANA ALVES BATISTA",
    username: "silvana.batista",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "SUELY DE MENEZES CARVALHO",
    username: "suely.carvalho",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "THAIS DO NASCIMENTO",
    username: "thais.nascimento",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "THIAGO RIBEIRO ALVES",
    username: "thiago.alves",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "VANESSA SIQUEIRA CLEMENTE",
    username: "vanessa.clemente",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "VICTOR BARBOSA BULLARA",
    username: "victor.bullara",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "VINICIUS DE SOUZA ZANARDI",
    username: "vinicius.zanardi",
    password: "123456",
    role: "Funcionário",
  },
  {
    name: "VITORIA SILVA BEZERRA",
    username: "vitoria.bezerra",
    password: "123456",
    role: "Funcionário",
  },
];

const rl = readline.createInterface({
  input,
  output,
});

const tiUsername = (
  await rl.question("Usuário da conta TI: ")
)
  .trim()
  .toLowerCase();

const tiPassword = await rl.question(
  "Senha da conta TI: "
);

rl.close();

async function signInTI() {
  // Primeiro tenta o padrão novo
  let result =
    await supabase.auth.signInWithPassword({
      email: `${tiUsername}@chamados.com.br`,
      password: tiPassword,
    });

  // Se não funcionar, tenta o padrão antigo
  if (result.error) {
    result =
      await supabase.auth.signInWithPassword({
        email: `${tiUsername}@chamados.local`,
        password: tiPassword,
      });
  }

  if (
    result.error ||
    !result.data.session?.access_token
  ) {
    throw new Error(
      result.error?.message ||
        "Não foi possível autenticar a conta TI."
    );
  }

  return result.data.session.access_token;
}

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

async function main() {
  console.log(
    `\nPreparando criação de ${users.length} usuários...`
  );

  const accessToken = await signInTI();

  console.log(
    "Conta TI autenticada com sucesso.\n"
  );

  const created = [];
  const failed = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    process.stdout.write(
      `[${String(i + 1).padStart(2, "0")}/${users.length}] ${user.username} ... `
    );

    try {
      const { data, error } =
        await supabase.functions.invoke(
          "hyper-processor",
          {
            body: user,

            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          }
        );

      if (error) {
        let message =
          error.message ||
          "Erro desconhecido";

        try {
          const body =
            await error.context?.json();

          message =
            body?.error ||
            body?.message ||
            message;
        } catch {}

        throw new Error(message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      created.push(user);

      console.log("OK");
    } catch (err) {
      failed.push({
        ...user,
        error:
          err?.message ||
          String(err),
      });

      console.log(
        `ERRO: ${err?.message || err}`
      );
    }

    // pequena pausa para não disparar
    // dezenas de chamadas de uma vez
    await sleep(250);
  }

  console.log(
    "\n========================================"
  );

  console.log(
    `Criados com sucesso: ${created.length}`
  );

  console.log(
    `Falharam: ${failed.length}`
  );

  console.log(
    "========================================"
  );

  if (failed.length > 0) {
    console.log(
      "\nUsuários que falharam:"
    );

    for (const user of failed) {
      console.log(
        `- ${user.username} (${user.name}): ${user.error}`
      );
    }

    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(
    "\nFalha na importação:",
    err.message || err
  );

  process.exit(1);
});