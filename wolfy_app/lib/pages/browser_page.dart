import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../services/gemini_service.dart';

class BrowserPage extends StatefulWidget {
  final String initialUrl;
  final String pageTitle;
  final List<String> allowedDomains;

  const BrowserPage({
    super.key,
    required this.initialUrl,
    required this.pageTitle,
    required this.allowedDomains,
  });

  @override
  State<BrowserPage> createState() => _BrowserPageState();
}

class _BrowserPageState extends State<BrowserPage> {
  late final WebViewController controller;
  final GeminiService _geminiService = GeminiService(); 
  
  bool _isThinking = false;
  bool _mostrarBalao = false;
  String _mensagemWolfy = "";

  @override
  void initState() {
    super.initState();

    final List<String> whitelist = widget.allowedDomains;

    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (NavigationRequest request) {
            bool ehSeguro = whitelist.any((site) => request.url.contains(site));

            if (!ehSeguro) {
              debugPrint("Bloqueado: ${request.url}");
              _mostrarAvisoDeBloqueio(request.url); 
              return NavigationDecision.prevent;    
            }

            return NavigationDecision.navigate;
          },
        ),
      )
      ..addJavaScriptChannel(
        'WolfyBridge',
        onMessageReceived: (JavaScriptMessage message) async {
          try {
            String respostaDoGemini = await _geminiService.analisarTextoDaTela(message.message);
            setState(() {
              _isThinking = false;
              _mensagemWolfy = respostaDoGemini;
              _mostrarBalao = true;
            });
          } catch (e) {
            setState(() {
              _isThinking = false;
              _mensagemWolfy = "Erro ao processar a página. Tenta novamente mais tarde.";
              _mostrarBalao = true;
            });
          }
        },
      )
      ..loadRequest(Uri.parse(widget.initialUrl));
  }

  void _mostrarAvisoDeBloqueio(String urlTentada) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              Image.asset('assets/wolfy_icon.png', height: 40),
              const SizedBox(width: 10),
              const Expanded(child: Text("Caminho Bloqueado", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold))),
            ],
          ),
          content: const Text(
            "O link onde tocaste tentava levar-te para um site que o Wolfy não reconhece.\n\n"
            "Para garantir a tua segurança e proteger os teus dados, bloqueámos esse site.\n\n"
            "Por favor, volta e clica apenas nos botões oficiais.",
            style: TextStyle(fontSize: 16),
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7B5CFA),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text("Voltar em Segurança", style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  void _wolfyAnalisarTela() async {
    if (_mostrarBalao) {
      setState(() => _mostrarBalao = false);
      return;
    }

    setState(() => _isThinking = true);
    
    const String jsCode = """
      (function() {
        var pageTitle = document.title;
        var pageUrl = window.location.href;
        var pageContent = document.body.innerText.split(' ').slice(0, 800).join(' '); 
        
        var fullData = {
          "titulo": pageTitle,
          "url": pageUrl,
          "conteudo": pageContent
        };
        
        WolfyBridge.postMessage(JSON.stringify(fullData));
      })();
    """;

    await controller.runJavaScript(jsCode);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.pageTitle),
        backgroundColor: Colors.white,
        elevation: 1,
      ),
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: controller),
            
            if (_mostrarBalao)
              Positioned(
                bottom: 100, 
                right: 16,
                left: 16,
                child: Material(
                  elevation: 8,
                  borderRadius: BorderRadius.circular(24),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFF7B5CFA).withOpacity(0.3), width: 2),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Image.asset('assets/wolfy_icon.png', height: 35),
                                const SizedBox(width: 12),
                                const Text(
                                  "O Wolfy diz:",
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF7B5CFA),
                                  ),
                                ),
                              ],
                            ),
                            IconButton(
                              icon: const Icon(Icons.close, color: Colors.black54),
                              onPressed: () => setState(() => _mostrarBalao = false),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            )
                          ],
                        ),
                        const SizedBox(height: 12),
                        Flexible(
                          child: SingleChildScrollView(
                            child: Text(
                              _mensagemWolfy,
                              style: const TextStyle(fontSize: 16, color: Colors.black87, height: 1.4),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            Positioned(
              bottom: 24,
              right: 24,
              child: FloatingActionButton(
                onPressed: _isThinking ? null : _wolfyAnalisarTela,
                backgroundColor: _mostrarBalao ? Colors.grey.shade300 : const Color(0xFF7B5CFA),
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
      ),
    );
  }
}