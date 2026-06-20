import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../services/gemini_service.dart'; // Importa nosso novo serviço

class BrowserPage extends StatefulWidget {
  const BrowserPage({super.key});

  @override
  State<BrowserPage> createState() => _BrowserPageState();
}

class _BrowserPageState extends State<BrowserPage> {
  late final WebViewController controller;
  final GeminiService _geminiService = GeminiService(); // Instancia a IA
  bool _isThinking = false;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..addJavaScriptChannel(
        'WolfyBridge',
        onMessageReceived: (JavaScriptMessage message) async {
          // PONTE REATIVADA: O JS enviou a string de dados
          try {
            // Envia o contexto da tela para o Gemini processar
            String respostaDoGemini = await _geminiService.analisarTextoDaTela(message.message);
            
            // Desativa o loading e exibe o veredito da IA na gaveta
            setState(() => _isThinking = false);
            _mostrarRespostaDoWolfy(respostaDoGemini);
          } catch (e) {
            setState(() => _isThinking = false);
            _mostrarRespostaDoWolfy("Erro ao processar a análise da tela.");
          }
        },
      )
      ..loadRequest(Uri.parse("https://google.com"));
  }

  // Captura agressiva e cirúrgica do DOM (Nosso content.js mobile)
  void _wolfyAnalisarTela() async {
    setState(() => _isThinking = true);

    const String jsCode = '''
      (() => {
        let dadosContexto = {
          titulo: document.title,
          enderecoUrl: window.location.href,
          elementosClicaveis: Array.from(document.querySelectorAll("button, a, input[type='submit']"))
                                   .map(e => e.innerText.trim() || e.value || e.placeholder)
                                   .filter(t => t !== undefined && t !== "")
                                   .slice(0, 15)
        };
        // Transmite o pacote estruturado via canal nativo
        WolfyBridge.postMessage(JSON.stringify(dadosContexto));
      })();
    ''';

    await controller.runJavaScript(jsCode);
  }

  void _mostrarRespostaDoWolfy(String textoLido) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true, // Permite que a gaveta cresça se o texto for longo
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.5,
          maxChildSize: 0.8,
          builder: (context, scrollController) {
            return SingleChildScrollView(
              controller: scrollController,
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Image.asset('assets/wolfy_icon.png', height: 48),
                      const SizedBox(width: 16),
                      const Text(
                        "Wolfy Explica:",
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF7B5CFA),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    textoLido, // <--- Aqui brilha a inteligência real do Gemini!
                    style: const TextStyle(fontSize: 18, color: Colors.black87, height: 1.4),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF7B5CFA),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: const Text("Obrigado, Wolfy!", style: TextStyle(color: Colors.white, fontSize: 18)),
                    ),
                  )
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Navegador Seguro Wolfy"),
        backgroundColor: Colors.white,
        elevation: 1,
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: controller),
          Positioned(
            bottom: 24,
            right: 24,
            child: FloatingActionButton(
              onPressed: _isThinking ? null : _wolfyAnalisarTela,
              backgroundColor: const Color(0xFF7B5CFA),
              elevation: 6,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
              child: _isThinking
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                    )
                  : Image.asset('assets/wolfy_icon.png', height: 35),
            ),
          ),
        ],
      ),
    );
  }
}