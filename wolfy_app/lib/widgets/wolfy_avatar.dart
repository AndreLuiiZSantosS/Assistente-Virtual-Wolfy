import 'package:flutter/material.dart';

class WolfyAvatar extends StatelessWidget {
  const WolfyAvatar({super.key});

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: 40,
      backgroundColor: Colors.deepPurple.shade100,
      backgroundImage: const AssetImage('assets/wolfy_icon.png'),
    );
  }
}