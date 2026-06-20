import 'package:flutter/material.dart';
import 'browser_page.dart'; 
import '../widgets/wolfy_card.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  static const Color wolfyPurple = Color(0xFF7B5CFA);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F7FB),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 16,
          ),
          child: Column(
            children: [
              const SizedBox(height: 10),

              // Logo + Nome
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(
                    "assets/wolfy_icon.png",
                    height: 85,
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Wolfy",
                        style: TextStyle(
                          fontSize: 38,
                          fontWeight: FontWeight.w800,
                          color: wolfyPurple,
                        ),
                      ),
                      Text(
                        "Seu guia digital",
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.black54,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 35),
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Bom dia! 👋",
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "O que deseja fazer hoje?",
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.black54,
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // CARD NAVEGAR - LIGADO COM A BROWSER PAGE!
              WolfyCard(
                icon: Icons.language,
                iconColor: Colors.blue,
                title: "Navegar na internet",
                subtitle: "Acesse qualquer site",
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const BrowserPage()),
                  );
                },
              ),
              const SizedBox(height: 16),

              WolfyCard(
                icon: Icons.school,
                iconColor: Colors.green,
                title: "Aprender algo novo",
                subtitle: "Tutoriais passo a passo",
                onTap: () {
                  print("Aprender clicado!");
                },
              ),
              const SizedBox(height: 16),

              WolfyCard(
                icon: Icons.chat_bubble_outline,
                iconColor: Colors.lightBlue,
                title: "Conversar com Wolfy",
                subtitle: "Tire suas dúvidas",
                onTap: () {
                  print("Conversar com Wolfy clicado!");
                },
              ),
              const SizedBox(height: 16),

              WolfyCard(
                icon: Icons.settings,
                iconColor: Colors.orange,
                title: "Configurações",
                subtitle: "Ajustes do aplicativo",
                onTap: () {
                  print("Configurações clicado!");
                },
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
      bottomNavigationBar: Container(
        height: 90,
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(
            top: BorderSide(
              color: Color(0xFFE8E8E8),
            ),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _navItem(
              icon: Icons.home,
              label: "Início",
              selected: true,
            ),
            _navItem(
              icon: Icons.language,
              label: "Navegar",
            ),
            Container(
              width: 65,
              height: 65,
              decoration: const BoxDecoration(
                color: wolfyPurple,
                shape: BoxShape.circle,
              ),
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Image.asset(
                  "assets/wolfy_icon.png",
                ),
              ),
            ),
            _navItem(
              icon: Icons.menu_book,
              label: "Aprender",
            ),
            _navItem(
              icon: Icons.bar_chart,
              label: "Progresso",
            ),
          ],
        ),
      ),
    );
  }

  Widget _navItem({
    required IconData icon,
    required String label,
    bool selected = false,
  }) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          icon,
          size: 28,
          color: selected ? wolfyPurple : Colors.black45,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: selected ? wolfyPurple : Colors.black45,
          ),
        ),
      ],
    );
  }
}