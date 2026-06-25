import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'browser_page.dart';
import '../widgets/wolfy_card.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  static const Color wolfyPurple = Color(0xFF7B5CFA);

  // === NAVEGAÇÃO SEGURA ===
  void _navegarParaSiteSeguro(BuildContext context, String title, String url, List<String> whitelist) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BrowserPage(
          initialUrl: url,
          pageTitle: title,
          allowedDomains: whitelist,
        ),
      ),
    );
  }

  // === GAVETA DE PLANOS DE SAÚDE ===
  void _mostrarOpcoesSaude(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Qual é o seu plano ou médico?",
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87),
              ),
              const SizedBox(height: 20),
              _opcaoGiganteSaude(context, "Unimed", Colors.green.shade700, Icons.local_hospital, "https://www.unimed.coop.br", ["unimed.coop.br"]),
              const SizedBox(height: 12),
              _opcaoGiganteSaude(context, "Hapvida", Colors.blue.shade800, Icons.health_and_safety, "https://www.hapvida.com.br", ["hapvida.com.br"]),
              const SizedBox(height: 12),
              _opcaoGiganteSaude(context, "Amil", Colors.teal.shade600, Icons.medical_services, "https://www.amil.com.br", ["amil.com.br"]),
              const SizedBox(height: 12),
              _opcaoGiganteSaude(context, "Meu SUS Digital", Colors.blue.shade600, Icons.badge, "https://meususdigital.saude.gov.br", ["saude.gov.br"]),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  Widget _opcaoGiganteSaude(BuildContext context, String nome, Color cor, IconData icone, String url, List<String> whitelist) {
    return SizedBox(
      width: double.infinity,
      height: 65,
      child: ElevatedButton.icon(
        style: ElevatedButton.styleFrom(
          backgroundColor: cor.withOpacity(0.1),
          foregroundColor: cor,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          alignment: Alignment.centerLeft,
          padding: const EdgeInsets.symmetric(horizontal: 20),
        ),
        icon: Icon(icone, size: 28),
        label: Text(nome, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        onPressed: () {
          Navigator.pop(context); // Fecha a gaveta
          _navegarParaSiteSeguro(context, nome, url, whitelist);
        },
      ),
    );
  }

  // === FUNÇÃO SOS (WhatsApp) ===
  Future<void> _dispararSOS() async {
    const String numeroDeEmergencia = "5584999999999"; 
    final Uri whatsappUrl = Uri.parse(
      "https://wa.me/$numeroDeEmergencia?text=Oi!%20Sou%20o%20Wolfy.%20Preciso%20de%20ajuda%20urgente!",
    );

    if (await canLaunchUrl(whatsappUrl)) {
      await launchUrl(whatsappUrl, mode: LaunchMode.externalApplication);
    } else {
      debugPrint("Não foi possível abrir o WhatsApp");
    }
  }

  @override
  Widget build(BuildContext context) {
    // SIMULAÇÃO DO ONBOARDING
    const String nomeUsuario = "Andre";
    const String estadoUsuario = "RN"; 

    // Lógica Geográfica
    late final String urlAgua;
    late final String urlLuz;
    late final List<String> whitelistGeografica;

    if (estadoUsuario == "RN") {
      urlAgua = "https://caern.rn.gov.br";
      urlLuz = "https://www.neoenergiacosern.com.br";
      whitelistGeografica = ["caern.rn.gov.br", "neoenergiacosern.com.br", "neoenergia.com"];
    } else if (estadoUsuario == "SP") {
      urlAgua = "https://agenciavirtual.sabesp.com.br";
      urlLuz = "https://www.enel.com.br";
      whitelistGeografica = ["sabesp.com.br", "enel.com.br", "enel.com"];
    } else {
      urlAgua = "https://www.google.com";
      urlLuz = "https://www.google.com";
      whitelistGeografica = ["google.com"];
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Olá, $nomeUsuario! 👋",
                            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Colors.black87),
                          ),
                          const Text(
                            "Eu sou o Wolfy, o teu guia digital.",
                            style: TextStyle(fontSize: 16, color: Colors.black54, fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                      Image.asset("assets/wolfy_icon.png", height: 75),
                    ],
                  ),

                  const SizedBox(height: 35),
                  const Text(
                    "O que desejas fazer hoje?",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87),
                  ),
                  const SizedBox(height: 20),

                  // === O BOTÃO INTOCÁVEL (Navegação Livre) ===
                  WolfyCard(
                    icon: Icons.public,
                    iconColor: wolfyPurple,
                    title: "Navegar na Internet",
                    subtitle: "Pesquisar no Google e ver sites.",
                    onTap: () => _navegarParaSiteSeguro(
                      context,
                      "Navegador Wolfy",
                      "https://www.google.com.br",
                      [""], // String vazia libera qualquer site nesse modo!
                    ),
                  ),
                  const SizedBox(height: 16),

                  // === BOTÕES DE INTENÇÕES ESPECÍFICAS ===
                  WolfyCard(
                    icon: Icons.shopping_basket,
                    iconColor: Colors.green,
                    title: "Quero fazer compras",
                    subtitle: "Ir para lojas oficiais e seguras.",
                    onTap: () => _navegarParaSiteSeguro(
                      context,
                      "Compras Seguras",
                      "https://www.mercadolivre.com.br",
                      ["mercadolivre.com.br", "mercadopago.com.br"],
                    ),
                  ),
                  const SizedBox(height: 16),

                  WolfyCard(
                    icon: Icons.favorite,
                    iconColor: Colors.red,
                    title: "Quero ver a minha Saúde",
                    subtitle: "Planos de saúde, boletos e exames.",
                    onTap: () => _mostrarOpcoesSaude(context),
                  ),
                  const SizedBox(height: 16),

                  WolfyCard(
                    icon: Icons.water_drop,
                    iconColor: Colors.blue,
                    title: "Segunda Via da Água",
                    subtitle: "Boleto da companhia de água.",
                    onTap: () => _navegarParaSiteSeguro(context, "Conta da Água", urlAgua, whitelistGeografica),
                  ),
                  const SizedBox(height: 16),

                  WolfyCard(
                    icon: Icons.lightbulb,
                    iconColor: Colors.amber.shade800,
                    title: "Segunda Via da Luz",
                    subtitle: "Boleto da companhia elétrica.",
                    onTap: () => _navegarParaSiteSeguro(context, "Conta da Luz", urlLuz, whitelistGeografica),
                  ),

                  const SizedBox(height: 100), // Espaço para o botão flutuante
                ],
              ),
            ),

            // BOTÃO SOS
            Positioned(
              bottom: 24,
              left: 24,
              right: 24,
              child: SizedBox(
                width: double.infinity,
                height: 65,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: wolfyPurple,
                    foregroundColor: Colors.white,
                    elevation: 8,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  ),
                  icon: const Icon(Icons.sos_outlined, size: 30),
                  label: const Text(
                    "EMERGÊNCIA / SOCORRO",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  onPressed: _dispararSOS,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}