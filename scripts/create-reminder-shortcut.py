#!/usr/bin/env python3
"""Build/sign the distributed Apple Shortcut; not a website build step.

Uses Apple's installed `shortcuts sign --mode anyone`. No personal reminder
list IDs or contact information are included. Child reminders inherit the
parent's list through the native WFParentTask parameter.
"""
import plistlib
import subprocess
import tempfile
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NAME = '菜谱食材加入提醒事项'


def identifier(name):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://recipes.maxoxo.me/shortcuts/' + name)).upper()


def token(value):
    return {'WFSerializationType': 'WFTextTokenAttachment', 'Value': value}


def output(name, label):
    return token({'Type': 'ActionOutput', 'OutputUUID': identifier(name), 'OutputName': label})


def text_variable(attachment):
    # Text fields use a token string; a bare attachment silently renders empty.
    return {'WFSerializationType': 'WFTextTokenString', 'Value': {
        'string': '\ufffc', 'attachmentsByRange': {'{0, 1}': attachment['Value']}}}


def action(kind, name, **params):
    return {'WFWorkflowActionIdentifier': 'is.workflow.actions.' + kind,
            'WFWorkflowActionParameters': {'UUID': identifier(name), **params}}


def workflow():
    source = token({'Type': 'ExtensionInput'})
    dictionary = output('dictionary', 'Dictionary')
    group = identifier('repeat')
    return {
        'WFWorkflowName': NAME,
        'WFWorkflowClientVersion': '3612.0.2.1',
        'WFWorkflowMinimumClientVersion': 900,
        'WFWorkflowMinimumClientVersionString': '900',
        'WFWorkflowIcon': {'WFWorkflowIconStartColor': 4274264319, 'WFWorkflowIconGlyphNumber': 61440},
        'WFWorkflowInputContentItemClasses': ['WFStringContentItem'],
        'WFWorkflowOutputContentItemClasses': [],
        'WFWorkflowHasShortcutInputVariables': True,
        'WFWorkflowNoInputBehavior': {'Name': 'WFWorkflowNoInputBehaviorShowError', 'Parameters': {}},
        'WFWorkflowHasOutputFallback': False,
        'WFWorkflowTypes': [],
        'WFQuickActionSurfaces': [],
        'WFWorkflowImportQuestions': [],
        'WFWorkflowActions': [
            action('comment', 'help', WFCommentActionText=(
                '从菜谱页面点击「加入 Apple 提醒事项」运行。先在下面第一个'
                '「添加新提醒事项」动作中选择支持子任务的 iCloud 清单。'
                '每次导入创建一组新任务；子任务保留食材分组及用量。')),
            action('detect.dictionary', 'dictionary', WFInput=source),
            action('getvalueforkey', 'title', WFInput=dictionary, WFDictionaryKey='title'),
            action('getvalueforkey', 'url', WFInput=dictionary, WFDictionaryKey='url'),
            action('getvalueforkey', 'ingredients', WFInput=dictionary, WFDictionaryKey='ingredients'),
            action('addnewreminder', 'parent',
                   WFCalendarItemTitle=text_variable(output('title', 'Dictionary Value')),
                   WFURL=output('url', 'Dictionary Value'),
                   WFCalendarItemNotes='菜谱食材购物清单；每项食材是一个子任务。'),
            action('repeat.each', 'repeat', WFInput=output('ingredients', 'Dictionary Value'),
                   WFControlFlowMode=0, GroupingIdentifier=group),
            action('addnewreminder', 'child',
                   WFCalendarItemTitle=text_variable(token({'Type': 'Variable', 'VariableName': 'Repeat Item'})),
                   WFParentTask=output('parent', 'New Reminder')),
            action('repeat.each', 'repeat-end', WFControlFlowMode=2, GroupingIdentifier=group),
            action('alert', 'done', WFAlertActionTitle='已加入提醒事项',
                   WFAlertActionMessage='食材已加入提醒事项，可在菜名任务下逐项勾选。',
                   WFAlertActionCancelButtonShown=False),
        ],
    }


if __name__ == '__main__':
    destination = ROOT / 'shortcuts/recipe-ingredients.shortcut'
    destination.parent.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='recipe-shortcut-') as directory:
        unsigned = Path(directory) / (NAME + '.shortcut')
        unsigned.write_bytes(plistlib.dumps(workflow(), sort_keys=False))
        subprocess.run(['shortcuts', 'sign', '--mode', 'anyone', '--input', str(unsigned),
                        '--output', str(destination)], check=True)
    print('Signed shortcut:', destination.relative_to(ROOT))
