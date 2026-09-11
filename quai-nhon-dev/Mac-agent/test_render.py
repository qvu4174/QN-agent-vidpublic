import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


MODULE_PATH = Path(__file__).with_name("render.py")
SPEC = importlib.util.spec_from_file_location("render", MODULE_PATH)
render = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(render)


class ResolveMusicAssetTests(unittest.TestCase):
    def selection(self, source_path):
        return {"selection_status": "selected", "source_path": source_path}

    def test_repo_layout_resolves_from_project_root(self):
        with tempfile.TemporaryDirectory() as directory:
            project_root = Path(directory) / "quai-nhon-dev"
            script_path = project_root / "Mac-agent" / "render.py"
            music_path = project_root / "styles" / "music" / "repo.mp3"
            music_path.parent.mkdir(parents=True)
            music_path.touch()
            with patch.object(render, "__file__", str(script_path)):
                self.assertEqual(render.resolve_music_asset(self.selection("styles/music/repo.mp3")), music_path)

    def test_runtime_layout_resolves_from_runtime_root(self):
        with tempfile.TemporaryDirectory() as directory:
            runtime_root = Path(directory) / "QN-Mac-Agent"
            script_path = runtime_root / "render.py"
            music_path = runtime_root / "styles" / "music" / "runtime.mp3"
            music_path.parent.mkdir(parents=True)
            music_path.touch()
            with patch.object(render, "__file__", str(script_path)):
                self.assertEqual(render.resolve_music_asset(self.selection("styles/music/runtime.mp3")), music_path)

    def test_runtime_root_wins_before_repo_fallback(self):
        with tempfile.TemporaryDirectory() as directory:
            project_root = Path(directory) / "quai-nhon-dev"
            script_path = project_root / "Mac-agent" / "render.py"
            runtime_path = project_root / "Mac-agent" / "styles" / "music" / "shared.mp3"
            repo_path = project_root / "styles" / "music" / "shared.mp3"
            runtime_path.parent.mkdir(parents=True)
            repo_path.parent.mkdir(parents=True)
            runtime_path.touch()
            repo_path.touch()
            with patch.object(render, "__file__", str(script_path)):
                self.assertEqual(render.resolve_music_asset(self.selection("styles/music/shared.mp3")), runtime_path)

    def test_traversal_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            project_root = Path(directory) / "quai-nhon-dev"
            script_path = project_root / "Mac-agent" / "render.py"
            with patch.object(render, "__file__", str(script_path)):
                with self.assertRaises(RuntimeError):
                    render.resolve_music_asset(self.selection("../../outside.mp3"))


if __name__ == "__main__":
    unittest.main()
